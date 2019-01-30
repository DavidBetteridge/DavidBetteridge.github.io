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

But can we do this without the magic of the __await__ keyword?  We can - there is a method on __Task__ called __ContinueWith__ which takes a function which gets called once the Task has been evaluated.  However because neither the original call (for example 'A') or the second call (for example 'B') have been completed at this point,  __ContinueWith__ has to return a Task<Task<int>>.  This task with in a task is then handled by the __Unwrap__ method.

This allows us to rewrite our main method as follows:

```c#
static void Main(string[] args)
{
    if (File.Exists("Log.txt")) File.Delete("Log.txt");

    File.AppendAllText("Log.txt", "Start\r\n");

    var c = A(1)
            .ContinueWith(t => B(t.Result))
            .Unwrap()
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

If we write the __.ContinueWith__ method as simply '·' then we are saying that (A·B)·C is the same as A·(B·C).  ie. ContinueWith is associative.



