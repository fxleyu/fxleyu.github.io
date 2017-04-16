---
layout   : post
title    : "学习行为型模式"
date     : 2017-04-10 21:42:00
author   : fxleyu
tags:
    - 设计模式
---

学习行为型模式：
- 责任链（chain of responsibility）
- 命令（command）
- 解释器（interpreter）
- 迭代器（iterator）
- 中介者（mediator）
- 备忘录（memento）
- 观察者（observer）
- 状态（state）
- 策略（strategy）
- 模板方法（template method）
- 访问者（visitor）

# 一、责任链
责任链模式是一种对象行为型模式。线性处理。

意图：使多个对象都有机会处理请求，从而避免请求的发送者和接收者之间的耦合关系。将这些对象
连成一条链，并沿着这条链传递改请求，直到有一个对象处理它为止。

适用性：    
- 有多个的对象可以处理一个请求，哪个对象处理改请求运行时刻自动确定。
- 你想在不明确接收者的情况下，向多个对象中的一个提交一个请求。
- 可处理一个请求的对象集合应被动态的指定。

## Java 实现
```java
abstract class PurchasePower {
    protected static final double BASE = 500;
    protected PurchasePower successor;

    abstract protected double getAllowable();
    abstract protected String getRole();

    public void setSuccessor(PurchasePower successor) {
        this.successor = successor;
    }

    public void processRequest(PurchaseRequest request){
        if (request.getAmount() < this.getAllowable()) {
            System.out.println(this.getRole() + " will approve $" + request.getAmount());
        } else if (successor != null) {
            successor.processRequest(request);
        }
    }
}

class ManagerPPower extends PurchasePower {

    protected double getAllowable() {
        return BASE * 10;
    }

    protected String getRole() {
        return "Manager";
    }
}

class DirectorPPower extends PurchasePower {

    protected double getAllowable() {
        return BASE * 20;
    }

    protected String getRole() {
        return "Director";
    }
}

class VicePresidentPPower extends PurchasePower {

    protected double getAllowable() {
        return BASE * 40;
    }

    protected String getRole() {
        return "Vice President";
    }
}

class PresidentPPower extends PurchasePower {

    protected double getAllowable() {
        return BASE * 60;
    }

    protected String getRole() {
        return "President";
    }
}

class PurchaseRequest {

    private double amount;
    private String purpose;

    public PurchaseRequest(double amount, String purpose) {
        this.amount = amount;
        this.purpose = purpose;
    }

    public double getAmount() {
        return this.amount;
    }

    public void setAmount(double amount)  {
        this.amount = amount;
    }

    public String getPurpose() {
        return this.purpose;
    }
    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }
}
```

## 实例
- Android 中的事件分发机制（待确认）
- UI 中的帮助处理模块

# 二、命令
命令模式是一种对象行为型模式。网状处理。

意图：将一个请求封装为一个对象，从而使你可用不同的请求对客户进行参数化；对请求排队或记录
请求日志、以及支持可撤销的操作。别名为动作（action），事务（transaction）

适用性：
- 像上面讨论的 MenuItem 对象那样，抽象处待执行的动作以参数化某对象。你可用过程语言中的
回调（callback）函数表示这种参数化机制。
- 在不同的时刻指定、排序和执行请求。
- 支持取消操作。
- 支持修改日志，这样当系统崩溃时，这些修改可用被重做一遍。
- 用构建在原语操作上的高层操作构建一个系统。这样一种结构在支持事务（transaction）的信息系统中很常见。

> 所谓回调函数是指函数先在某处注册，而它将在稍后某个需要的时候被调用。命令模式是回调机制
的一个面向对象的替代品。

## 结构
![命令模式_结构](https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Command_pattern.svg/1050px-Command_pattern.svg.png)

## java实例
```java
/** The Command interface */
public interface Command {
   void execute();
}

/** The Invoker class */
public class Switch {
   private List<Command> history = new ArrayList<Command>();

   public void storeAndExecute(final Command cmd) {
      this.history.add(cmd); // optional
      cmd.execute();
   }
}

/** The Receiver class */
public class Light {
   public void turnOn() {
      System.out.println("The light is on");
   }

   public void turnOff() {
      System.out.println("The light is off");
   }
}

/** The Command for turning on the light - ConcreteCommand #1 */
public class FlipUpCommand implements Command {
   private Light theLight;

   public FlipUpCommand(final Light light) {
      this.theLight = light;
   }

   @Override    // Command
   public void execute() {
      theLight.turnOn();
   }
}

/** The Command for turning off the light - ConcreteCommand #2 */
public class FlipDownCommand implements Command {
   private Light theLight;

   public FlipDownCommand(final Light light) {
      this.theLight = light;
   }

   @Override    // Command
   public void execute() {
      theLight.turnOff();
   }
}

/* The test class or client */
public class PressSwitch {
   public static void main(final String[] arguments){
      // Check number of arguments
      if (arguments.length != 1) {
         System.err.println("Argument \"ON\" or \"OFF\" is required.");
         System.exit(-1);
      }

      final Light lamp = new Light();
      final Command switchUp = new FlipUpCommand(lamp);
      final Command switchDown = new FlipDownCommand(lamp);
      final Switch mySwitch = new Switch();
      switch(arguments[0]) {
         case "ON":
            mySwitch.storeAndExecute(switchUp);
            break;
         case "OFF":
            mySwitch.storeAndExecute(switchDown);
            break;
         default:
            System.err.println("Argument \"ON\" or \"OFF\" is required.");
            System.exit(-1);
      }
   }
}
```

```java
/**
 * The Command functional interface.<br/>
 */
@FunctionalInterface
public interface Command {
	public void apply();
}

public final class CommandFactory {
	private final HashMap<String, Command>	commands;

	private CommandFactory() {
		commands = new HashMap<String,Command>();
	}

	public void addCommand(final String name, final Command command) {
		commands.put(name, command);
	}

	public void executeCommand(String name) {
		if (commands.containsKey(name)) {
			commands.get(name).apply();
		}
	}

	public void listCommands() {
		System.out.println("Enabled commands: " + commands.keySet().stream().collect(Collectors.joining(", ")));
	}

	/* Factory pattern */
	public static CommandFactory init() {
		final CommandFactory cf = new CommandFactory();

		// commands are added here using lambdas. It is also possible to dynamically add commands without editing the code.
		cf.addCommand("Light on", () -> System.out.println("Light turned on"));
		cf.addCommand("Light off", () -> System.out.println("Light turned off"));

		return cf;
	}
}

public final class Main {
	public static void main(final String[] arguments) {
		final CommandFactory cf = CommandFactory.init();

		cf.executeCommand("Light on");
		cf.listCommands();
	}
}
```

## 实例
- 监听器


# 三、解释器
意图：给定一个语言，定义它的文法的一种表示，并定义一个解释器，这个解释器使用改表示来解释
语言中的句子。

适用性：
- 该文法简单对于复杂的文法，文法的类层次变得庞大而无法管理。
- 效率不是一个关键问题。最高效的解释器通常不是通过直接解释语法分析树实现的，而是首先将它
们转换成另一种形式。

## 结构
![解释器_结构](https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Interpreter_UML_class_diagram.svg/804px-Interpreter_UML_class_diagram.svg.png)

## java实例
```java
interface Expression {
    public int interpret(final Map<String, Expression> variables);
}

class Number implements Expression {
    private int number;
    public Number(final int number)       { this.number = number; }
    public int interpret(final Map<String, Expression> variables)  { return number; }
}

class Plus implements Expression {
    Expression leftOperand;
    Expression rightOperand;
    public Plus(final Expression left, final Expression right) {
        leftOperand = left;
        rightOperand = right;
    }

    public int interpret(final Map<String, Expression> variables) {
        return leftOperand.interpret(variables) + rightOperand.interpret(variables);
    }
}

class Minus implements Expression {
    Expression leftOperand;
    Expression rightOperand;
    public Minus(final Expression left, final Expression right) {
        leftOperand = left;
        rightOperand = right;
    }

    public int interpret(final Map<String, Expression> variables) {
        return leftOperand.interpret(variables) - rightOperand.interpret(variables);
    }
}

class Variable implements Expression {
    private String name;
    public Variable(final String name)       { this.name = name; }
    public int interpret(final Map<String, Expression> variables) {
        if (null == variables.get(name)) return 0; // Either return new Number(0).
        return variables.get(name).interpret(variables);
    }
}

class Evaluator implements Expression {
    private Expression syntaxTree;

    public Evaluator(final String expression) {
        final Stack<Expression> expressionStack = new Stack<Expression>();
        for (final String token : expression.split(" ")) {
            if (token.equals("+")) {
                final Expression subExpression = new Plus(expressionStack.pop(), expressionStack.pop());
                expressionStack.push(subExpression);
            } else if (token.equals("-")) {
                // it's necessary remove first the right operand from the stack
                final Expression right = expressionStack.pop();
                // ..and after the left one
                final Expression left = expressionStack.pop();
                final Expression subExpression = new Minus(left, right);
                expressionStack.push(subExpression);
            } else
                expressionStack.push(new Variable(token));
        }
        syntaxTree = expressionStack.pop();
    }

    public int interpret(final Map<String, Expression> context) {
        return syntaxTree.interpret(context);
    }
}

public class InterpreterExample {
    public static void main(final String[] args) {
        final String expression = "w x z - +";
        final Evaluator sentence = new Evaluator(expression);
        final Map<String, Expression> variables = new HashMap<String, Expression>();
        variables.put("w", new Number(5));
        variables.put("x", new Number(10));
        variables.put("z", new Number(42));
        final int result = sentence.interpret(variables);
        System.out.println(result);
    }
}
```

## 实例
- 正则表达式

# 四、迭代器
意图：提供一种方法顺序访问一个聚合对象中各个元素，而又不需暴露该对象的内部表示。别名，游
标（cursor）。

适用性：
- 访问一个聚合对象的内容而无需暴露它的内部表示。
- 支持对聚类对象的多种遍历。
- 为遍历不同聚类结构的聚合结构提供一个统一的实现（即，支持多态迭代）。


# 五、中介者
意图：用一个中介对象来封装一系列的对象交互。中介者使各对象不需要显式地相互引用，从而使其耦合松散，而且可用独立地改变它们之前的交互。

适用性：
- 一组对象一定以定义良好但是复杂的方式进行通信。产生的相互依赖关系结构混乱且难以理解。
- 一个对象引用其他很多对象并且直接与这些对象通信，导致难以复用该对象。
- 想定制一个分布在多个类中的行为，而不想生成太多的子类。

# 六、备忘录
意图：在不破坏封装的前提下，捕获一个对象的内部状态，并在该对象之外保存这个状态。这样以后就可将该对象恢复到原先保存的状态。

适用性：
- 必须保存一个对象在某一个时刻的（部分）状态，这样以后需要时，它才能恢复到先前的状态。
- 如果一个用接口来让其它对象直接得到这些状态，将会暴露对象的实现细节并破坏对象的封装性。

# 七、观察者
意图：定义对象间的一种一对多的依赖关系，当一个对象的状态发生变化时，所有依赖于它的对象都得到通知并被自动更新。别名，依赖（dependents），发布-订阅（publish-subscribe）

适用性：
- 当一个抽象模型有两个方面，其中一个方面依赖于另一方面。将这两者封装在独立的对象中以使它们可以各自独立地改变和复用。
- 当对一个对象的改变需要同时改变其它对象，而不知道具体多少对象有待变化。
- 当一个对象必须通知其它对象，而它又不能假定其它对象是谁。换言之，你不需要这些对象使紧密耦合的。

# 八、状态
意图：允许一个对象在其内部改变时改变它的行为。对象看起来似乎改变了它的类。别名，状态对象（objects for states）

适用性：
- 一个对象的行为取决于它的状态，并且它必须在运行时刻根据状态改变它的行为。
- 一个操作中含有庞大的多分支的条件，且这些分支依赖于该对象的状态。这个状态通常用一个或多个枚举常量表示。通常，有多个操作包含这一相同的条件结构。状态模式将每一个条件分支放入一个独立的类中。这使得你可以根据对象自身的情况将对象的状态作为一个对象，这一对象可以不依赖于其它对象而独立变化。

# 九、策略
意图：定义一系列的算法，把它们一个个封装起来，并且使它们可相互替换。本模式使得算法可对立于它的客户端而变化。别名，政策（policy）

适用性：
- 许多相关的类仅仅是行为有异。“策略”提供了一种用多个行为中的一个行为来配置一个类的方法。
- 需要使用一个算法的不同变体。
- 算法使用客户不应该知道的数据。可使用策略模式以避免暴露复杂的、与算法相关的数据结构。
- 一个类定义了很多行为，并且这些行为在这个类的操作中以多个条件语句的形式出现。将相关的条件分支移入它们各自的策略类中以替换这些条件语句。


# 十、模板方法
意图：定义一个操作中的算法的骨架，而将一些步骤延迟到子类中。模板方法使得子类可以不改变一个算法的结构，即可重定义该算法的某些特定步骤。

适用性：
- 一次性实现一个算法的不变部分，并将可变的行为留给子类实现。
- 各子类中的公共的行为应被提取出来并集中到一个公共父类中以避免代码重复。
- 控制子类扩展。模板方法只在特定点调用“hook”操作，这样就只允许在这些点进行扩展。


# 十一、访问者
意图：表示一个作用于某对象结构中的各元素的操作。它使你可以在不改变各元素的类的前提下定义作用于这些元素的新操作。

适用性：
- 一个对象结构包含很多类对象，它们有不同的接口，而你想对这些对象实施一些依赖于其具体类的操作。
- 需要对一个对象结构中的对象进行很多不同的并且不相关的操作，而你想避免这些操作“污染”这些对象的类。访问者使得你可以将相关操作集中起来定义在一个类中。当该对象结构被很多应用共享时，用访问者模式对每个应用仅包含需要用到的操作。
- 定义对象结构的类很少改变，但经常需要在此结构上定义新的操作。改变对象结构类需要重定义对所有访问者的接口，这可能需要很大的代价。如果对象结构类经常改变，那么可能还是在这些类中定义这些操作比较好。
