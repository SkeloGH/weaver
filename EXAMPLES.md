For example, a database has the following collections/documents:

```javascript
  // db.users.findOne({_id: ObjectId('abcdef78901234abcdef1234')})
  {
    _id: ObjectId('abcdef78901234abcdef1234'),
    name: 'John',
    orders: [ { orderId: '4321fedcbafedcba67890123' } ]
  }

  // db.orders.findOne({_id: ObjectId('4321fedcbafedcba67890123')})
  {
    _id: ObjectId('4321fedcbafedcba67890123'),
    cartId: 'fedcba67890123fedcba4321'
  }

  // db.carts.findOne({_id: ObjectId('fedcba67890123fedcba4321')})
  {
    _id: ObjectId('fedcba67890123fedcba4321'),
    userId: 'abcdef78901234abcdef1234'
  }
```

Note how `user` relates to `order`, and `order` relates to `cart`.

If you wanted to copy `orders` and `carts` associated to the `user` to your another DB (for example your local DB for debugging purposes), you'd need to:

1. Go to the `[users|orders|carts] collection` and find the document.
2. Check if any of the fields is a reference to another collection.
3. Copy the reference value.
4. Repeat from step 1.

This tool finds the relationships, and copies them to a destination db:

| Query                                                    | source db   | target db   |
| -------------------------------------------------------- | ----------- | ----------- |
| `db.users.findOne(ObjectId('abcdef78901234abcdef1234'))` |      1      |      1      |
| `db.orders.findOne(ObjectId('4321fedcbafedcba67890123'))`|      1      |      1      |
| `db.carts.findOne(ObjectId('fedcba67890123fedcba4321'))` |      1      |      1      |


![Entity-relationship graph](https://github.com/SkeloGH/weaver/raw/develop/images/example_graph.png?raw=true)