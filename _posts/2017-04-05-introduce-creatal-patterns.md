---
layout   : post
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
适用性：
- 当创建复杂对象的算法应该独立于该对象的组成部分以及它们的装配方式时。
- 当构造过程必须允许被构造的对象有不同的表示时。

![Structure](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Builder_UML_class_diagram.svg/750px-Builder_UML_class_diagram.svg.png)

```java
/**
 * Represents the product created by the builder.
 */
class Car {
    private int wheels;
    private String color;

    public Car() {
    }

    @Override
    public String toString() {
        return "Car [wheels = " + wheels + ", color = " + color + "]";
    }

    public int getWheels() {
        return wheels;
    }

    public void setWheels(final int wheels) {
        this.wheels = wheels;
    }

    public String getColor() {
        return color;
    }

    public void setColor(final String color) {
        this.color = color;
    }
}

/**
 * The builder abstraction.
 */
interface CarBuilder {
    CarBuilder setWheels(final int wheels);

    CarBuilder setColor(final String color);

    Car build();
}

class CarBuilderImpl implements CarBuilder {
    private Car car;

    public CarBuilderImpl() {
        car = new Car();
    }

    @Override
    public CarBuilder setWheels(final int wheels) {
        car.setWheels(wheels);
        return this;
    }

    @Override
    public CarBuilder setColor(final String color) {
        car.setColor(color);
        return this;
    }

    @Override
    public Car build() {
        return car;
    }
}

public class CarBuildDirector {
    private CarBuilder builder;

    public CarBuildDirector(final CarBuilder builder) {
        this.builder = builder;
    }

    public Car construct() {
        return builder.setWheels(4).setColor("Red").build();
    }

    public static void main(final String[] arguments) {
        CarBuilder builder = new CarBuilderImpl();
        CarBuildDirector carBuildDirector = new CarBuildDirector(builder);
        System.out.println(carBuildDirector.construct());

```


# 工厂方法（factory method）
意图：定义一个用于创建对象的接口，让子类决定实例化哪一个类。工厂方法使一个类的实例化延迟到其子类。
适用性：
- 当一个类不知道它所必须创建的对象的类的时候。
- 当一个类希望由它的子类来指定它所创建的对象的时候。
- 当类将创建对象的职责委托给了多个帮助子类中的一个，并且你希望将哪一个帮助子类是代理者这一信息局部化的时候。
![Structure](https://upload.wikimedia.org/wikipedia/commons/d/df/New_WikiFactoryMethod.png)

```java
public abstract class MazeGame {
    private final List<Room> rooms = new ArrayList<>();

    public MazeGame() {
        Room room1 = makeRoom();
        Room room2 = makeRoom();
        room1.connect(room2);
        rooms.add(room1);
        rooms.add(room2);
    }

    abstract protected Room makeRoom();
}

public class MagicMazeGame extends MazeGame {
    @Override
    protected Room makeRoom() {
        return new MagicRoom();
    }
}

public class OrdinaryMazeGame extends MazeGame {
    @Override
    protected Room makeRoom() {
        return new OrdinaryRoom();
    }
}

MazeGame ordinaryGame = new OrdinaryMazeGame();
MazeGame magicGame = new MagicMazeGame();
```

# 原型（prototype）
意图：用原型实例来指定创建对象的种类，并且通过拷贝这些原型创建新的对象。
![Structure](https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Prototype_UML.svg/900px-Prototype_UML.svg.png)

```java
// Prototype pattern

	 public abstract class Prototype implements Cloneable {
		 public Prototype clone() throws CloneNotSupportedException{
			 return (Prototype) super.clone();
		}
	}

	 public class ConcretePrototype1 extends Prototype {
		@Override
		 public Prototype clone() throws CloneNotSupportedException {
			return super.clone();
		}
	}

	public class ConcretePrototype2 extends Prototype {
		@Override
		public Prototype clone() throws CloneNotSupportedException {
			return super.clone();
		}
	}
```

# 单件（singleton）
意图：保证一个类仅有一个实例，并提供一个访问它的全局访问店。

![class_diagram](https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Singleton_UML_class_diagram.svg/330px-Singleton_UML_class_diagram.svg.png)
```java
public final class Singleton {
    private static final Singleton INSTANCE = new Singleton();

    private Singleton() {}

    public static Singleton getInstance() {
        return INSTANCE;
    }
}

// Lazy initialization
public final class Singleton {
    private static volatile Singleton instance = null;

    private Singleton() {}

    public static Singleton getInstance() {
        if (instance == null) {
            synchronized(Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```
