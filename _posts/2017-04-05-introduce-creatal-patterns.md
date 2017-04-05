title    : "学习创建型模式"
date     : 2017-04-05 22:40:00
author   : fxleyu
tags:
    - 设计模式
---

创建型模式
- 抽象工厂（abstract factory）
- 生成器（builder）
- 工厂方法（factory method）
- 原型（prototype）
- 单件（singleton）

# 抽象工厂
对象创建型模式--- 隐藏实现
意图：提供一个创建一系列相关或相互依赖对象的接口，而无须指定它们的具体的类。
适用性：
- 一个系统要独立于他的产品的创建、组合和表示时
- 一个系统要由多个产品系列中的一个来配置时
- 当你要强调一系列相关的产品对象的设计以便进行联合使用时
- 当你提供一个产品类库，而只想显示它们的接口而不是实现时

![class_diagram](https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Abstract_factory.svg/776px-Abstract_factory.svg.png)

![UML_class_diagram](https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Abstract_factory_UML.svg/1016px-Abstract_factory_UML.svg.png)

```java
public interface IButton {
	void paint();
}

public interface IGUIFactory {
	public IButton createButton();
}

public class WinFactory implements IGUIFactory {
	@Override
	public IButton createButton() {
		return new WinButton();
	}
}

public class OSXFactory implements IGUIFactory {
	@Override
	public IButton createButton() {
		return new OSXButton();
	}
}

public class WinButton implements IButton {
	@Override
	public void paint() {
		System.out.println("WinButton");
	}
}

public class OSXButton implements IButton {
	@Override
	public void paint() {
		System.out.println("OSX button");
	}
}

public class Main {

	public static void main(String[] args) throws Exception {
		IGUIFactory factory = null;

		String appearance = randomAppearance();//current operating system
		if (appearance.equals("osx")) {
			factory = new OSXFactory();
		} else if(appearance.equals("windows")) {
			factory = new WinFactory();
		} else {
			throw new Exception("No such operating system");
		}

		IButton button = factory.createButton();
		button.paint();

	}

	/**
	 * This is just for the sake of testing this program, and doesn't have to do
	 * with Abstract Factory pattern.
	 * @return
	 */
	public static String randomAppearance() {
		String[] appearanceArr = new String[3];
		appearanceArr[0] = "osx";
		appearanceArr[1] = "windows";
		appearanceArr[2] = "error";
		java.util.Random rand = new java.util.Random();
		int randNum = rand.nextInt(3);
		return appearanceArr[randNum];
	}

}
```

# 生成器
意图：将一个复杂对象的构建与它的表示分离，使得同样的创建过程可以创建不同的表示。
