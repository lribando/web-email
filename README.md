# web-email

Serving email pages.

## How to run

Install dependencies

Requires gulp

    npm install -g gulp @gilt-tech/swig

Requires swig and gulp to be installed in the web-email directory as well

    npm install gulp @gilt-tech/swig

Once installed run in the main directory

    swig init && swig install

If you get an error or can't run you many need to install 
  
    npm install -g @gilt-tech/swig@1.5.0

Tunnel the dependencies

    gg-props-tunnel -lf production

Start the app

    swig run

# How to deploy

web-email uses [nova deploy](https://github.com/gilt/nova), but as it also needs to deploy assets to the CDN we wrap nova deploy in a module called [@gilt-tech/swig-nova](https://github.com/gilt/gilt-swig-nova).

If you have not previously run the app and as a result installed the dependcies required you need @gilt-tech/swig installed globally and the local dependencies.

    /web/web-email> npm install -g gulp @gilt-tech/swig
    /web/web-email> npm install

For available options see the output of:

    > swig nova-deploy -h
    Usage:
    swig nova-deploy [options]

    Options:
      --env            Name of environment in nova.yml to deploy to.
      --stack          Name of stack in nova.yml to deploy to.
      --new-version    Deploy a new version, valid options are (patch|minor|major). Version will
                       be incremented in package.json accordingly and tagged in git.
      --version        Specify new version manually. Value should be N.N.N and newer that latest
                       deployed version.

## Releasing a new version (with CDN assets)

swig uses the same conventions as nova deploy tool for specifying deploy environment target and deploy stack target. swig will manage the version bump for you if you use the option `--new-version`. There is also the option to specify a new version manually using the `--version` option. This must be greater than the current version.
swig identifies the current version by searching for tags in git in the format `v1.2.3` and parses the latest (i.e. current) tag.

    swig nova-deploy --env common --stack [staging|canary|production] --new-version [patch|minor|major]
    swig nova-deploy --env common --stack [staging|canary|production] --version 1.2.3

Note: production and canary are separate stacks which require separate explicit deploys. So a normal workflow might be deploy a new build to deploy

    swig nova-deploy --env common --stack canary --new-version patch

.e.g version built above: 1.0.25

Then after sanity or soak in test with canary deploy to production:

    nova deploy common production 1.0.25

## Releasing to subsequent environments/stacks

If a certain version of the app has been built using `swig nova-deploy` then to deploy to the other stacks you only need use nova tool directly. e.g.:

    nova common production <version built by swig-nova>

## Deploy Examples

### Sandbox1 New Build

    swig nova-deploy --env backoffice --stack sandbox --new-version [patch|minor|major]

### Sandbox1 Existing Build

    nova deploy backoffice sandbox N.N.N

## Lint UI code

    swig lint
# web-email
