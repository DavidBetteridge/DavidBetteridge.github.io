---
layout: post
title: Calling an async method
---

## Overview

This post is a beginners guide to using async methods.  You should be able to follow these steps without understand how it works.

## What is an asynchronous method
You can think of an asynchronous method as a function which will run on a different thread and complete executing sometime in the future.

As a result can't be directly returned from the method (as it hasn't completed yet) an object of type `Task` is returned.  When the method finally completes,  the task will contain the result of the function.

Most of the time you don't need to worry about writing code to run on a different thread, you just need to know how to call the provided methods.

## Identifying an asynchronous method
The best way to determine if a method is asynchronous is by it's return type.  An asynchronous method will return either a `Task` or a `Task<T>`.  For example a method called `GetCustomerAsync` might have a return type of `Task<Customer>` .

Another clue is the name of the function,  by convention they end with __Async__.  For example the asynchronous version of `DataReader.Read()` is called `ReadAsync()`.

Finally if you don't spot that the function is asynchronous then you will find you can't use the result returned by the function.

For example this synchronous version is fine  

```c#
var customer = GetCustomer(1);
Console.WriteLine(customer.Name)
```

but this asynchronous version won't compile as customer contains a `Task<Customer>` not a `Customer`.

```c#
var customer = GetCustomerAsync(1);
Console.WriteLine(customer.Name)
```

the correct code would be

```c#
var customer = await GetCustomer(1);
Console.WriteLine(customer.Name)
```

## Calling an asynchronous method

As you may have spotted in the example above,  you have to place the keyword __await__ in front of the method call.  If you try the following example however you will notice that it doesn't compile.

```c#
public void AddMessageToLogFile(string message)
{
    await System.IO.File.WriteAllTextAsync("Log.txt", message);
}
```

this is because in order to use the __await__ keyword you have to add the word __async__ to the function signature.

```c#
//Don't do this!
public async void AddMessageToLogFile(string message)
{
    await System.IO.File.WriteAllTextAsync("Log.txt", message);
}
```

The code will compile but is still wrong.  With one exception,  whenever you have an `async` method you must return `Task` rather than `void` and `Task<T>` rather than just T.  ie `Task<string>` not just `string`

Our correct code then looks like this

```c#
public async Task AddMessageToLogFile(string message)
{
    await System.IO.File.WriteAllTextAsync("Log.txt", message);
}
```

(There is a more efficient way of writing this method but we will ignore that for now)


## Calling an asynchronous method which calls an asynchronous method

If you now try to use our `AddMessageToLogFile` method you will find that the same rules apply.  We have to prefix it with `await` and change the function to `async Task`.  For example

```c#
public async Task<decimal> CalculateGrossValue(decimal netValue, decimal taxValue)
{
    var grossValue = netValue + taxValue;
    await AddMessageToLogFile($"Gross Value is {grossValue}");
    return grossValue;
}
```

and then you make the same change to the function which calls `CalculateGrossValue` and so until you reach the entry point of you code.

## A real world example

Here is a real-world example of calling a SQL Server stored procedure.  Note that the `await` is used in three different places within the code.

```c#
public async Task<List<Customer>> AllCustomers(string connectionString)
{
    var results = new List<Customer>();
    using (var cn = new SqlConnection(connectionString))
    {
        await cn.OpenAsync();

        using (var cmd = new SqlCommand())
        {
            cmd.Connection = cn;
            cmd.CommandType = System.Data.CommandType.StoredProcedure;
            cmd.CommandText = "dbo.usp_AllCustomers";

            using (var dr = await cmd.ExecuteReaderAsync())
            {
                while (await dr.ReadAsync())
                {
                    results.Add(new Customer()
                    {
                        Name = (string)dr["Name"]
                    });
                }
            }
        }
    }
    return results;
}
```



