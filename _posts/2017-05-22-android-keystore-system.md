---
layout   : post
title    : "Android KeyStore学习"
date     : 2017-05-22 23:24:00
author   : fxleyu
tags:
    - Android
---
Android KeyStore是Android系统对于Java安全架构的自定义实现。KeyStore是通过实现Provider接口的方式来实现的。


```java
// ~/system/security/keystore/key_store_service.cpp 是Android KeyStore具体逻辑的实现

// ~/frameworks/base/keystore 是KeyStore实现Java安全架构的接口。

// ~/frameworks/base/core/java/com/android/internal/os/ZygoteInit.java 是把Android KeyStore配置到Android VM中。

// /data/misc/keystore/...  存储位置
```



# 什么是密钥库
密钥库系统由 KeyChain API 以及在 Android 4.3（API 级别 18）中引入的 Android 密钥库提
供程序功能使用。
Android 的加密系统，是独立与JDK的，其Java只是定义了spi而已。


```java
KeyPairGenerator
// frameworks/base/keystore
android.security.keystore.AndroidKeyStoreKeyPairGeneratorSpi

```

# 基本知识
1、加密模型

2、CA

# 简要理解

# 深入理解
## 1、 在设置中安装证书
Settings >> Security >> Install from SD card

```xml
<!-- 点击安装证书，实际上是启动如下Intent -->
<intent android:action="android.credentials.INSTALL"
        android:targetPackage="com.android.certinstaller"
        android:targetClass="com.android.certinstaller.CertInstallerMain"/>
```

启动后 certinstaller 应用的
```java

final String[] mimeTypes = MIME_MAPPINGS.keySet().toArray(new String[0]);
final Intent openIntent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
openIntent.setType("*/*");
openIntent.putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes);
openIntent.putExtra(DocumentsContract.EXTRA_SHOW_ADVANCED, true);
startActivityForResult(openIntent, REQUEST_OPEN_DOCUMENT);

// 然后
if (requestCode == REQUEST_OPEN_DOCUMENT) {
    if (resultCode == RESULT_OK) {
        startInstallActivity(null, data.getData());
    } else {
        finish();
    }
}
```
如果数据检查无误，会使用如下`CertInstaller`来进行安装。
```java
if (mCredentials.hasCaCerts()) {
    KeyguardManager keyguardManager = getSystemService(KeyguardManager.class);
    Intent intent = keyguardManager.createConfirmDeviceCredentialIntent(null, null);
    if (intent == null) { // No screenlock
        onScreenlockOk();
    } else {
        // 重新确认安全密码
        startActivityForResult(intent, REQUEST_CONFIRM_CREDENTIALS);
    }
}
```
安装证书
```java
X509Certificate cert = mCredentials.getUserCertificate();
if (cert != null) {
    // find matched private key
    String key = Util.toMd5(cert.getPublicKey().getEncoded());
    Map<String, byte[]> map = getPkeyMap();
    byte[] privatekey = map.get(key);
    if (privatekey != null) {
        Log.d(TAG, "found matched key: " + privatekey);
        map.remove(key);
        savePkeyMap(map);

        mCredentials.setPrivateKey(privatekey);
    } else {
        Log.d(TAG, "didn't find matched private key: " + key);
    }
}
nameCredential();
```
安装Activity为
```java
Intent createSystemInstallIntent(final Context context) {
    Intent intent = new Intent("com.android.credentials.INSTALL");
    // To prevent the private key from being sniffed, we explicitly spell
    // out the intent receiver class.
    if (!isWear(context)) {
        intent.setClassName(Util.SETTINGS_PACKAGE, "com.android.settings.CredentialStorage");
    } else {
        intent.setClassName("com.google.android.apps.wearable.settings",
                "com.google.android.clockwork.settings.CredentialStorage");
    }
    intent.putExtra(Credentials.EXTRA_INSTALL_AS_UID, mUid);
    try {
        if (mUserKey != null) {
            intent.putExtra(Credentials.EXTRA_USER_PRIVATE_KEY_NAME,
                    Credentials.USER_PRIVATE_KEY + mName);
            intent.putExtra(Credentials.EXTRA_USER_PRIVATE_KEY_DATA,
                    mUserKey.getEncoded());
        }
        if (mUserCert != null) {
            intent.putExtra(Credentials.EXTRA_USER_CERTIFICATE_NAME,
                    Credentials.USER_CERTIFICATE + mName);
            intent.putExtra(Credentials.EXTRA_USER_CERTIFICATE_DATA,
                    Credentials.convertToPem(mUserCert));
        }
        if (!mCaCerts.isEmpty()) {
            intent.putExtra(Credentials.EXTRA_CA_CERTIFICATES_NAME,
                    Credentials.CA_CERTIFICATE + mName);
            X509Certificate[] caCerts
                    = mCaCerts.toArray(new X509Certificate[mCaCerts.size()]);
            intent.putExtra(Credentials.EXTRA_CA_CERTIFICATES_DATA,
                    Credentials.convertToPem(caCerts));
        }
        return intent;
    } catch (IOException e) {
        throw new AssertionError(e);
    } catch (CertificateEncodingException e) {
        throw new AssertionError(e);
    }
}
```

```java
android.security.KeyStore.put();
```
## 2、设置安全模式为 None

# 总结
