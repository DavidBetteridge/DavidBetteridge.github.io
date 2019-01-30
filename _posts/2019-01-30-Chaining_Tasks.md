---
layout: post
title: Chaining Tasks
---

The __await__ keyword makes it very easy for us to call multiple async methods from within a single method.  For example

```c#
static async Task Main(string[] args)
{
    if (File.Exists("Log.txt")) File.Delete("Log.txt");

    File.AppendAllText("Log.txt", "Start\r\n");

    var a = await A(1);
    var b = await B(a);
    var c = await C(b);


    File.AppendAllText("Log.txt", $"C is {c}\r\n");
}

public static async Task<int> A(int value)
{
    await File.AppendAllTextAsync("Log.txt", "Method A\r\n");
    return value + 1;
}

public static async Task<int> B(int value)
{
    await File.AppendAllTextAsync("Log.txt", "Method B\r\n");
    return value + 1;
}

public static async Task<int> C(int value)
{
    await File.AppendAllTextAsync("Log.txt", "Method C\r\n");
    return value + 1;
}
```        

When the program runs,  'c' will end up with a value of 4.

But can we do this without the magic of the __await__ keyword?  We can - there is a method on __Task__ called __ContinueWith__ which takes a function which gets called once the Task has been evaluated.  However because neither the original call (for example 'A') or the second call (for example 'B') have been completed at this point,  __ContinueWith__ has to return a Task<Task<int>>.  This task within a task is then handled by the __Unwrap__ method.

This allows us to rewrite our main method as follows:

```c#
static void Main(string[] args)
{
    if (File.Exists("Log.txt")) File.Delete("Log.txt");

    File.AppendAllText("Log.txt", "Start\r\n");

    var c = (A(1)
            .ContinueWith(t => B(t.Result))
            .Unwrap())
            .ContinueWith(t => C(t.Result))
            .Unwrap()
            .Result
            ;

    File.AppendAllText("Log.txt", $"C is {c}\r\n");
}
```        

Note - I'm using __.Result__ instead of __GetAwaiter().GetResult()__ purely to make the example easier to read.

We can also move the brackets around so that the method reads

```c#
var c = A(1)
    .ContinueWith(t => 
        B(t.Result)
            .ContinueWith(t2 => C(t2.Result))
            .Unwrap()
            .Result
    ).Result;

```
and this also returns the same results.

If we write the __.ContinueWith__ method as simply '·' then we are saying that (A·B)·C is the same as A·(B·C).  ie. __ContinueWith__ is associative.


---

Can we create our own Task<T> object without calling an asynchronous method?  Yes - __Task__ comes with a static method called __FromResult__.  For example

```c#
Task<int> myTask = Task.FromResult(123);
var anotherTask = Task.FromResult("Hello World");
```

This means we can turn any value of type T into a Task<T>.

----

Can we modify the value inside of a Task<T> whilst keeping it a Task<T>?

For example we can turn the string within a Task<string> into uppercase

```c#
public static Task<string> ToUpperCase(Task<string> task)
{
    return task.ContinueWith(
        t => {
            var unwrapped = t.Result;
            var inUpperCase = unwrapped.ToUpper();
            return inUpperCase;
            }
        );
}
```        

this is much easier with async/await

```c#
public async static Task<string> ToUpperCase(Task<string> task)
{
    return (await task).ToUpper();
}
```

In both cases we have preserved the important property of a Task,  in that it's asynchronous.

---

We have just seen that we can go from Task<T> to Task<T>  but can we go from Task<T> to Task<S>?

The following example shows us going Task<string> to Task<int>

```c#
public static Task<int> StringLength(Task<string> task)
{
    return task.ContinueWith(
        t => {
            var unwrapped = t.Result;
            var inUpperCase = unwrapped.Length;
            return inUpperCase;
        }
        );
}
```        



### References

https://ericlippert.com/2013/02/28/monads-part-three/