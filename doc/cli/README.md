# Getting started

## Install the npm package

- For now, only dev version can be installed, refer to "How to test the CLI in dev mode" below.

## Using the CLI tool

- After installing, just issue the `weaver` command, the CLI help will display:

```
Usage: weaver [OPTIONS] COMMAND [ARG...]
       weaver [ --help | -v | --version ]

Commands:
  weaver run        Runs the app with the loaded configuration
  weaver add        Creation of client, query or ignore
  weaver remove     Removal of clients, queries or ignores

Options:
  --version, -v    Print version information and quit
  --config, -c     Read or set path of config file, default: undefined
  --dry            Run but don't save
  --info           Displays the current settings
  --json           Write the output in the configured JSON file
  --json-file      The JSON filepath where output will be streamed to
  --limit          The max amount of docs to retrieve
  --queries, --qq  Document ids to get relationships from, e.g.: 2a3b4c5d6e7f8g9h2a3b4c5d e7f8g9h2a3b4c5d2a3b4c5d6
  --verbose, -V    Enable highest level of logging, same as DEBUG=*
  --help           Show help
```

### 1. Add clients

To pull data from a db into another, you'll need to add both the `source` and `target` client. `source` is where the data will be retrieved from, and `target` is where you want to save the retrieved data.

- On the CLI, issue the `weaver add client` command, the CLI help will display:

```
Usage: weaver add client -fntou --options.<option_name>

  -f [mongodb]          <String> The client db family, mongodb is only supported for now.
  -n <name>             <String> The client db name.
  -t [source|target]    <String> source if the data will be pulled from it, target otherwise.
  -o [<source.name>]    <String> The target's origin db where the data will be copied from.
  -u <url>              <String> The client db URL.
  --options.<opt_name>  <Any> Client db-specific options, for now MongoClient options, use dot notation to set each option
                        Example: --options.readPreference secondaryPreferred
```

Example:

Assume the following remote server settings for `source`:
- Type: mongodb
- IP: 100.101.102.103
- Port: 27017
- Database name: production

```
weaver add client -f mongodb -n production -t source -u mongodb://100.101.102.103:27017
```

Assume the following local server settings for `target`:
- Type: mongodb
- IP: 127.0.0.1
- Port: 27017
- Database name: development

```
weaver add client -f mongodb -n development -t target -o production -u mongodb://127.0.0.1:27017
```

### 2. Find the document to clone

On the `source` database, find the document you want to copy to the `target` database and use the _id string:

Assume the following mongodb document in the `source` database, `pets` collection:

```
{
    _id: ObjectId("507f1f77bcf86cd799439011"),
    name: "fluffy"
}
```

You'll then just copy `507f1f77bcf86cd799439011`.

### 3. Copy document(s)

Once steps 1 & 2 are done, just issue the following command:

```
weaver run --queries 507f1f77bcf86cd799439011
```

If all is correct, you should now have a copy of the document in your `target` database, even if the collection didn't exist previously:

```
> mongodb
mongodb> use development
mongodb> db.pets.find("507f1f77bcf86cd799439011")

{
    _id: ObjectId("507f1f77bcf86cd799439011"),
    name: "fluffy"
}

>
```

## How to test the CLI in dev mode

### Install the CLI tool

- After installing the repo and dependencies, run `npm run build`.
- Run `npm pack` on the project root.
- A file `weaver-<VERSION>.tgz` will be created.
- Run `npm install -g weaver-<VERSION>.tgz`, it will install the package globally.

## Uninstall the CLI tool

- Run `npm uninstall -g weaver`.

