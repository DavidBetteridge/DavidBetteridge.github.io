---
layout: post
title: Extracting values from a task.
---

Consider the following code

```c#
static async Task Main(string[] args)
{
    if (File.Exists("Log.txt")) File.Delete("Log.txt");

    File.AppendAllText("Log.txt", "Main 1\r\n");
    var t = AnAsyncOperation();

    File.AppendAllText("Log.txt", "Main 2\r\n");
    Thread.Sleep(TimeSpan.FromSeconds(1));

    File.AppendAllText("Log.txt", "Main 3\r\n");
    await t;

    File.AppendAllText("Log.txt", "Main 4\r\n");
}

public static async Task AnAsyncOperation()
{
    throw new ApplicationException("Please bring the warp drive online before calling this method.");
}
```

Do you think the entry __Main 3__ gets written to the log file,  or will the exception be throw that line of code gets reached?

As you should have just found, the exception isn't thrown until you _await_ t.   

You can think of the __await__ keyword working as follows.   Assume that task (T) is a box which contains 'Either' our result or an exception.  We need to get the value out of the box,  but as we don't know if a fault has occurred,  we have to supply two functions to cover both cases.

Behind the scenes, the __await__ keyword 'could' be thought of as

```c#
t.Fold (  
            ((System.AggregateException ae) => throw ae.innerException),
            ((result) => return result )
       );
```













