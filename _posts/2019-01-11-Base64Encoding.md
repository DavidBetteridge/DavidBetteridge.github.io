---
layout: post
title: Base64 Encoding
---

Following on from yesterday's Huffman coding,  I thought that I would write a Base64 encoder in C#.

At first glance this seems straight forward

1.  Convert each character in the input text into it's ASCII value
2.  Convert the ascii value into an 8 bit (octet) binary string (left pad with 0s as needed)
3.  Join all the binary strings together
4.  Chuck the long string into 6 bit (sextet) blocks
5.  Lookup the character which represents each block

This can almost be written in a single linq statement however....  the issue comes when the length of the long string does not divide evenly into 6.  For example the string "AB" would only produce 16 (2x8) bits and 16/6 has a reminder of 4.

In order to be able to pad out the final block, we have to work on the string in blocks of 3 octets (24bits or 4 sextets) at a time.

1.  Convert each character in the input text into it's ASCII value
2.  Convert the ascii value into an 8 bit (octet) binary string (left pad with 0s as needed)
3.  Join all the binary strings together
4.  Chuck the long string into 24 bit blocks (3 octets/4 sextets)
        If the length of the block is 8 characters pad the final sextet and append == to the result.
        If the length of the block is 16 characters pad the final sextet and append = to the result.
5.  Lookup the character which represents each sextet


Steps 1-3 are straight forward with the following Linq

```c#
var asBinary = string.Join("", text.Select(c => Convert.ToString(c, 2).PadLeft(8, '0')));
```

In order to work on the binary string in blocks of 3 octets we use a helper function.  This has to handle the case when the final block is less then 24 bits long.

```c#
private IEnumerable<string> ThreeOctets(string binaryText)
{
    var offset = 0;
    while (offset < binaryText.Length)
    {
        if (offset + 24 >= binaryText.Length)
            yield return binaryText.Substring(offset);
        else
            yield return binaryText.Substring(offset, 24);
        offset += 24;
    }
}
```

We use a switch statement to add the three possible padding cases

```c#
var result = "";
foreach (var block in ThreeOctets(asBinary))
{
    switch (block.Length)
    {
        case 8:
            result += ConvertSextet(0, block) +
                      ConvertSextet(1, block) +
                        "==";
            break;
        case 16:
            result += ConvertSextet(0, block) +
                      ConvertSextet(1, block) +
                      ConvertSextet(2, block) +
                      "=";
            break;

        default:
            result += ConvertSextet(0, block) +
                      ConvertSextet(1, block) +
                      ConvertSextet(2, block) +
                      ConvertSextet(3, block);
            break;
    }
}
```

The __ConvertSextet__ function handles the extracting the 6 bits which make up the sextet from the 3 octel string.  If then converts the 6 bits into base10,  and uses that to look up it's matching character.  Again,  this function has to take care and right-pad the sextet with zeros if the input block is too short. 

```c#
private string ConvertSextet(int sextetNumber, string block)
{
    var blockStart = sextetNumber * 6;
    if (blockStart + 6 >= block.Length)
        return Lookup(Convert.ToByte(block.Substring(blockStart).PadRight(6, '0'), 2)).ToString();
    else
        return Lookup(Convert.ToByte(block.Substring(blockStart, 6), 2)).ToString();
}
```

Finally we have the lookup function

```c#
private char Lookup(byte index)
{
    if (index <= 25)
        return (char)(index + 'A');
    else if (index <= 51)
        return (char)(index - 26 + 'a');
    else if (index <= 61)
        return (char)(index - 52 + '0');
    else if (index <= 62)
        return '+';
    else if (index <= 63)
        return '/';
    else
        return ' ';
}
```

The complete code with tests is available on [github](https://github.com/DavidBetteridge/Base64Encoder) 
