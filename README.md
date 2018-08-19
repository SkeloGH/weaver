# Weaver

A MongoDB relational collection field mapping, visualizing and importing tool

# Say what

Often times documents have references to other documents or collections, which result in complex-to-replicate data sets that result in wasted time while trying to retrieve every data entry with its connections.

To name an example. let's say you have these mongodb collections, represented as schemas

```
  Cart
  {
    _id: ObjectId,
    userId: ObjectId
  }

  User
  {
    _id: ObjectId,
    orders: [
      {
        orderId: ObjectId
      }
    ]
  }

  Order
  {
    _id: ObjectId,
    cartId: ObjectId
  }
```

If you wanted to manually retrieve a User's related data, you'd need to:

- Go over the collection and find the desired document
- Check if any of the fields is reference to another collection
- Copy the reference value
- Go over the referenced collection
- Repeat from step 1

This tool instead will help you visualize the relationships, and even download them automatically:

![Basic visualization of collection relationships](/images/example_graph.png?raw=true)

# Usage

[WIP]