---
layout: post
title: dotnet-counters?
---

## dotnet-counters

.NET Core 3.0 and above has built in support for monitoring performance counters generated by your application.

### Getting started

Install as a global dotnet tool using `dotnet tool install --global dotnet-counters`

Then view the list of available counters using `dotnet-counters list`.  At the time of writing there are two sets, `System.Runtime` and `Microsoft.AspNetCore.Hosting` although it is possible to also monitor user defined counters.

``` powershell
System.Runtime
    cpu-usage                                    Amount of time the process has utilized the CPU (ms)
    working-set                                  Amount of working set used by the process (MB)
    gc-heap-size                                 Total heap size reported by the GC (MB)
    gen-0-gc-count                               Number of Gen 0 GCs / sec
    gen-1-gc-count                               Number of Gen 1 GCs / sec
    gen-2-gc-count                               Number of Gen 2 GCs / sec
    time-in-gc                                   % time in GC since the last GC
    gen-0-size                                   Gen 0 Heap Size
    gen-1-size                                   Gen 1 Heap Size
    gen-2-size                                   Gen 2 Heap Size
    loh-size                                     LOH Heap Size
    alloc-rate                                   Allocation Rate
    assembly-count                               Number of Assemblies Loaded
    exception-count                              Number of Exceptions / sec
    threadpool-thread-count                      Number of ThreadPool Threads
    monitor-lock-contention-count                Monitor Lock Contention Count
    threadpool-queue-length                      ThreadPool Work Items Queue Length
    threadpool-completed-items-count             ThreadPool Completed Work Items Count
    active-timer-count                           Active Timers Count

Microsoft.AspNetCore.Hosting
    requests-per-second                  Request rate
    total-requests                       Total number of requests
    current-requests                     Current number of requests
    failed-requests                      Failed number of requests
```

Start your application running than find it's PID,  either using `ps`,  TaskManager or easier still `dotnet-counters ps`

``` powershell
    12345   MyApplication c:\software\MyApplication.exe
```

## Real-Time Monitoring

The `dotnet-counters monitor` command can be used to view the counters as they change in real time.  It should be started with `-p` followed by your application's PID and then a space separated list of counters to monitor.   (The documentation says that all counters are included by default, but I found that only the `System.Runtime` ones are.)

This example shows all counters

``` powershell
dotnet-counters monitor -p 12345 System.Runtime Microsoft.AspNetCore.Hosting
```

``` powershell
Press p to pause, r to resume, q to quit.
    Status: Running

[System.Runtime]
    # of Assemblies Loaded                           179
    % Time in GC (since last GC)                       0
    Allocation Rate (Bytes / sec)                204,200
    CPU Usage (%)                                      0
    Exceptions / sec                                   0
    GC Heap Size (MB)                                 23
    Gen 0 GC / sec                                     0
    Gen 0 Size (B)                             9,415,056
    Gen 1 GC / sec                                     0
    Gen 1 Size (B)                                   856
    Gen 2 GC / sec                                     0
    Gen 2 Size (B)                             9,156,440
    LOH Size (B)                              10,809,624
    Monitor Lock Contention Count / sec                0
    Number of Active Timers                           10
    ThreadPool Completed Work Items / sec              1
    ThreadPool Queue Length                            0
    ThreadPool Threads Count                           4
    Working Set (MB)                                 147
    ...
```

Individual counters can be monitored by listing them within square brackets.  For example

``` powershell
dotnet-counters monitor -p 28764 Microsoft.AspNetCore.Hosting[requests-per-second,failed-requests]
```

``` powershell
Press p to pause, r to resume, q to quit.
    Status: Running

[Microsoft.AspNetCore.Hosting]
    Failed Requests                                    0
    Request / sec                                      0
```

An optional `--refreshInterval` argument controls (in seconds) how often the counters are refreshed.

## Collection

In addition to monitoring the counters in real time it is possible periodically collect them and write them to a file using `dotnet-counters collect`

This takes the same `-p`,  `--refreshInterval` and list of counters as the `monitor` command,  but also takes two additional arguments `--format` and `--output`

+ `--format` is the type of file to create,  either `csv` (default) or `json`.
+ `--output` is an optional argument to specify the name of the file to create.  By default this is `counter.csv` / `counter.json` and will be created in the current folder.

It looks like this file will get pretty big quickly,  so choose the counters to collect and refresh interval wisely!


## Troubleshooting

If not counters are being collected then

1. Using `dotnet-counters ps` double check the PID of your process

2. Make sure that the list of counter sets is correct.  These are space separated (not comma).

3. If you are specifying individual counters,  then make sure that these are commas separated without any spaces.

## References

Microsoft documentation - https://docs.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-counters

NDC Talk (Hidden gems in .NET Core 3 - David Fowler & Damian Edwards) - https://www.youtube.com/watch?v=xdSSH63IZZc