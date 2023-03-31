# Policy Engine

Policy Engine is a semi general-use service for manging authorization policies.
It's built for `Push` in mind, but there's no reason it cannot be used by other
services. To be clear however, it's use case it authorization of users or machines
and not a rules/decision engine.

## Security Notes

Policy Engine is meant to be used as a component to another service. It doesn't have
it's own authentication or authorization. My suggestion would be to use it as a sidecar
on the API workload in k8s or locked to a specific SG of the API running outside of k8s.

While it's not particularly designed for centralization, you could build a service that
manages auth for a domain with it and use namespaces for capabilities within a domain. Just
don't try and use it directly for more than one app.

## Policies

There are currently three modes of operations. Two of which are related.

## Dynamic Policies

By simply passing in JSON based policies you can execute them with no other requirements.
You do not need a database, it won't even try to connect to one.

## Document Based Policies

The other two modes of operation depend on which field you pass in to the engine. They both
however deal with policies saved as documents in the database. These can be JSON or YAML.

Using the `policy` field simply loads that specific policy and executes it.

Using the `namespace` field does something much more interesting. It's the primary mode
of operation for the policy engine.

### Namespace based Policies

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
