---
layout   : post
title    : "Android 组件之加载器学习"
date     : 2017-05-25 23:44:00
author   : fxleyu
tags:
    - Android
---
# 加载器（Loader）概述
```
// android.app.LoaderManager
用于给用户和系统提供接口
// android.app.LoaderManager.LoaderCallbacks
用于给用户和系统提供接口
// android.content.Loader
监听器管理，以及灰回调接口管理（onXxx）
// android.content.AsyncTaskLoader

// android.content.CursorLoader
```

# 加载器机制涉及内容

## `getLoadManager`实现
```java
LoaderManagerImpl getLoaderManager(String who, boolean started, boolean create) {
    if (mAllLoaderManagers == null) {
        mAllLoaderManagers = new ArrayMap<String, LoaderManager>();
    }
    LoaderManagerImpl lm = (LoaderManagerImpl) mAllLoaderManagers.get(who);
    if (lm == null) {
        if (create) {
            lm = new LoaderManagerImpl(who, this, started);
            mAllLoaderManagers.put(who, lm);
        }
    } else {
        lm.updateHostController(this);
    }
    return lm;
}
```
`initLoader`的内部逻辑为
```java
public <D> Loader<D> initLoader(int id, Bundle args, LoaderManager.LoaderCallbacks<D> callback) {
    LoaderInfo info = mLoaders.get(id);
    if (info == null) {
        // Loader doesn't already exist; create.
        info = createAndInstallLoader(id, args,  (LoaderManager.LoaderCallbacks<Object>)callback);
    } else {
        info.mCallbacks = (LoaderManager.LoaderCallbacks<Object>)callback;
    }
    if (info.mHaveData && mStarted) {
        // If the loader has already generated its data, report it now.
        info.callOnLoadFinished(info.mLoader, info.mData);
    }
    return (Loader<D>)info.mLoader;
}
```
`createAndInstallLoader`
```java
private LoaderInfo createAndInstallLoader(int id, Bundle args,
        LoaderManager.LoaderCallbacks<Object> callback) {
    LoaderInfo info = new LoaderInfo(id, args,  (LoaderManager.LoaderCallbacks<Object>)callback);
    info.mLoader = callback.onCreateLoader(id, args);
    info.start();
    return info;
}
```
`LoaderInfo.start()`;
```java
void start() {
  mLoader.registerListener(mId, this);
  mLoader.registerOnLoadCanceledListener(this);
  mLoader.startLoading();
}
```

以`CursorLoader`为例，其`startLoading`方法逻辑为
```java
public final void startLoading() {
    onStartLoading();
}

protected void onStartLoading() {
    if (mCursor != null) {
        deliverResult(mCursor);
    }
    if (takeContentChanged() || mCursor == null) {
        forceLoad();
    }
}

public void forceLoad() {
    onForceLoad();
}

@Override
protected void onForceLoad() {
    super.onForceLoad();
    cancelLoad();
    mTask = new LoadTask();
    if (DEBUG) Log.v(TAG, "Preparing load: mTask=" + mTask);
    executePendingTask();
}

void executePendingTask() {
    if (mCancellingTask == null && mTask != null) {
        if (mTask.waiting) {
            mTask.waiting = false;
            mHandler.removeCallbacks(mTask);
        }
        if (mUpdateThrottle > 0) {
            long now = SystemClock.uptimeMillis();
            if (now < (mLastLoadCompleteTime+mUpdateThrottle)) {
                // Not yet time to do another load.
                if (DEBUG) Log.v(TAG, "Waiting until "
                        + (mLastLoadCompleteTime+mUpdateThrottle)
                        + " to execute: " + mTask);
                mTask.waiting = true;
                mHandler.postAtTime(mTask, mLastLoadCompleteTime+mUpdateThrottle);
                return;
            }
        }
        if (DEBUG) Log.v(TAG, "Executing: " + mTask);
        mTask.executeOnExecutor(mExecutor, (Void[]) null);
    }
}
```
Task
```java
@Override
protected D doInBackground(Void... params) {
    if (DEBUG) Log.v(TAG, this + " >>> doInBackground");
    try {
        D data = AsyncTaskLoader.this.onLoadInBackground();
        if (DEBUG) Log.v(TAG, this + "  <<< doInBackground");
        return data;
    } catch (OperationCanceledException ex) {
        if (!isCancelled()) {
            // onLoadInBackground threw a canceled exception spuriously.
            // This is problematic because it means that the LoaderManager did not
            // cancel the Loader itself and still expects to receive a result.
            // Additionally, the Loader's own state will not have been updated to
            // reflect the fact that the task was being canceled.
            // So we treat this case as an unhandled exception.
            throw ex;
        }
        if (DEBUG) Log.v(TAG, this + "  <<< doInBackground (was canceled)", ex);
        return null;
    }
}
```
```java
protected D onLoadInBackground() {
    return loadInBackground();
}

@Override
public Cursor loadInBackground() {
    synchronized (this) {
        if (isLoadInBackgroundCanceled()) {
            throw new OperationCanceledException();
        }
        mCancellationSignal = new CancellationSignal();
    }
    try {
        Cursor cursor = getContext().getContentResolver().query(mUri, mProjection, mSelection,
                mSelectionArgs, mSortOrder, mCancellationSignal);
        if (cursor != null) {
            try {
                // Ensure the cursor window is filled.
                cursor.getCount();
                cursor.registerContentObserver(mObserver);
            } catch (RuntimeException ex) {
                cursor.close();
                throw ex;
            }
        }
        return cursor;
    } finally {
        synchronized (this) {
            mCancellationSignal = null;
        }
    }
}
```

# 加载器使用

# 加载器详解

# 总结
- CursorLoader 获取的 Cursor 不要在 Cursor 外使用
