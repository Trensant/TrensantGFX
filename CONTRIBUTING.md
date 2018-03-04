## Contributing to TrensantGW

Welcome to this new web graphics library.  There are various ways to get involved and participate in its development

### Adding New Charts

With this library we have picked some of the more popular graphics and chart libraries, and started with a few of the most widely used charts requested by Trensant customers.

If there is a chart you would like to be available and want to add it yourself the community greatly welcomes these chart additions.

TODO: add notes and details here on steps for chart addition when testing details are framed


### Bug Fixes

Find a bug and want to fix it?  Great!  Looking for ways to contribute and see an open issue that you would like to tackle?  The community welcomes the help, just contact us and we can get you started as a contributor.

### Reviewing Contributions & Changes

Some people dont have time to always be doing hands on coding and contribution to open source projects, but can spare cycles for reviewing code contributions and providing feedback and guidance.


### Documentation Enhancements

Documentation is always a pain point in most open source projects, its always an ongoing effort to add to the docs and enhance and fix existing content.

Should you find an error in the docs, or want to suggest a fix, simple fork, make the edit, and submit a pull request back.

### Writing Tests

Are you a test junky?  Test suites are one of the bigger areas lacking currently in the project, if you have experience or interest around nodejs and front end testing we welcome any help and contributions.


## Steps for Contribution

### Issue Creation

* Create an issue with a descriptive title (ie: bug in pie chart with long labels)
* Add a good description, if bug add any details to reproduce
* Set a label for type (base types are 'enhancement','bug'), you can add additional labels for `docs` or `testing` if its related

### Pull Request

* [Fork](https://help.github.com/articles/fork-a-repo/) the [https://github.com/Trensant/TresantGW](https://github.com/Trensant/TresantGW) project
* Clone your fork, create a new working branch for making your fixes/enhancements on
* If docs and tests should be added, plese do so before submitting
* (TODO: add test verification specifics once done)
* [Open a pull request](https://help.github.com/articles/using-pull-requests/) against the master branch
    * Give the pull request a title in the form [TGW-xxxx][TYPE/LABEL] Title, where TGX-xxx is the issue number, TYPE/LABEL is one of `CORE`, `D3`, `GOOG`,etc  
    * If you want early review and feedback while still completing add [WIP] to the end after [TYPE/LABEL]

### Review Process

Committers in the project will review you updates as soon as they can.  Given that sometimes there can be delays or other updates happening at the same time, you might run into merge conflicts or required updates before closing out.

You pull request can’t be merged until any conflict are resolved. This can be resolved by adding a remote to keep up with upstream changes by 
`git remote add upstream https://github.com/Trensant/TrensantGW.git`, then running 
`git fetch upstream` followed by 
`git rebase upstream/master` and resolving the conflicts by hand.

You can then push the result to your branch

### Closing/Accepting your Pull Request

Once reviewed and if things are looking good, your pull request will be accepted and merged.  If rejected, for whatever reason, please close promptly.

## Coding/Style Guidelines

Please use 2-space tab indents, and adhere to nodejs best practice guidelines

TOOD: do we want to stick to any particular coding style guide?  If so we can reference here

## Contributing License Notice

When you contribute code, you affirm that the contribution is your original work and that you 
license the work to the project under the project's open source license. Whether or not you 
state this explicitly, by submitting any copyrighted material via pull request, email, or 
other means you agree to license the material under the project's open source license and 
warrant that you have the legal authority to do so.
