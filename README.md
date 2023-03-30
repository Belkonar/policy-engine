# Policy Engine

There are currently three modes of operations. Two of which are related.

## Dynamic Rules

By simply passing in JSON based policies you can execute them with no other requirements.
You do not need a database, it won't even try to connect to one.

## Document Based Rules

The other two modes of operation depend on which field you pass in to the engine. They both
however deal with policies saved as documents in the database. These can be JSON or YAML.

Using the `policy` field simply loads that specific policy and executes it.

Using the `namespace` field does something much more interesting. It's the primary mode
of operation for the policy engine.

### Namespace based Rules

Passing in a set of namespaces separated by `.` characters allows you to load
all the policies for all the namespaces selected and execute them in order.
Here's an example of a namespace used in `Push`

`global.org.org:57af7f6d-f6f7-4af1-b182-3a30440fa781`

This will then split into three requests for the following namespaces.

```
global
org
org:57af7f6d-f6f7-4af1-b182-3a30440fa781
```

It will return the policies ordered with the ordinal provided (if one was provided).

After compiling them it will execute them all in order and return the results.

When you save a document the namespace will be set by splitting the document key
with `-` and taking the first element. So `global-admins` will be placed under the namespace
`global`.

Given these rules make sure to not use any of these characters (`.-`) in your namespaces.
You can feel free to use them **after** the namespace as part of the document key.

One small addition is that if **zero** policies are returned by the namespace gathering,
a default permission of `["*"]` will be returned. This effectively makes is so that if
the database is empty it will give the appropriate permissions to setup the initial RBAC
rule sets.

Depending on the complexity of the namespaces and/or policies, I would suggest caching
them with a key format of `perm-{subject}-{namespace}`. Since dashes cannot be used in
a namespace it's relatively safe from collision.

## Database

We are using mongo for document storage. While it's probably not needed to add indexes to the
singular collection, if it's large or hit a ton you can feel free to add these.

```
{ namespace: 1 }
{ ordinal: 1 }
```
