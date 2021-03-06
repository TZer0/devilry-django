See http://devilry.org for documentation. The rest of this readme is intended for developers.


# Setup a local development environment with testdata


## 1 - Check out from GIT

If you plan to develop devilry, you should fork the devilry-django repo,
changes to your own repo and request inclusion to the master repo using github
pull requests. If you are just trying out devilry, use:

    $ git clone https://github.com/devilry/devilry-django.git

The ``master`` branch, which git checks out by default, is usually the latest
semi-stable development version. The latest stable version is in the
``latest-stable`` branch.


## 2 - Install dependencies/requirements

### Mac OSX

1. Install **XCode** (from app store)
2. Install other dependencies/requirements:

        $ sudo easy_install fabric virtualenv


### Ubuntu Linux

    $ sudo apt-get install fabric build-essential python-dev python-virtualenv


## 3 - Setup a buildout cache (optional)

You should setup your [buildout cache](https://github.com/devilry/devilry-django/wiki/Use-a-global-buildout-config-to-speed-up-bin-buildout) if you plan to do any development. This will make any up re-run of buildout (the dependency/build system we use).


## 4 - Create a demo database

    $ fab setup_demo

Note: Creating the testdata takes a lot of time, but you can start using the
server as soon as the users have been created (one of the first things the
script does).


### Alternative step 4 - Setup an empty databse

    $ fab reset syncdb


### Alternative step 4 - From database dump
Creating the demo database takes a lot of time (12mins on a macbook air with SSD disk). You may ask a developer to send you a dump, and use it instead of ``setup_demo``:

    $ fab reset
    $ fab restore_db:/path/to/dbdump.sql


### Alternative step 4 - Manually (without fabric)

Create a clean development environment with an empty database:

    $ cd devenv/
    $ virtualenv virtualenv
    $ virtualenv/bin/python ../bootstrap.py
    $ bin/buildout
    $ bin/django_dev.py dev_autogen_extjsmodels
    $ bin/django_dev.py syncdb

Autocreate the demo-db:

    $ bin/django_dev.py dev_autodb -v2


## 5 - Run the development server

    $ bin/django_dev.py runserver

Go to http://localhost:8000/ and log in as a superuser using:

    user: grandma
    password: test

Or as a user which is student, examiner and admin using:

    user: thor
    password: test

**Note:** All users have ``password==test``, and you can see all users in
the superadmin interface. See [the demo page on the wiki](https://github.com/devilry/devilry-django/wiki/demo)
for more info about the demo database, including recommended test users for each role.


# Why Fabric?

We use [Fabric](http://fabfile.org) to simplify common tasks. Fabric simply runs the requested ``@task`` decorated functions in ``fabfile.py``.

``fabfile.py`` is very straigt forward to read if you wonder what the tasks actually do. The ``fabric.api.local(...)`` function runs an executable on the local machine.
