
# Setup Guide for Mac Users with Corporate git credentials.

This guide is for corporate contributors who are already using corporate git accounts and need to configure their system to support using a separate public github account in addition to their pre-existing corporate account.


## Setup SSH config for multiple hosts.

### Step 1: Setup a github.com user account if you don't already have one.

Use a personal email account, not your corporate email account.

### Step 2: Generate a new ssh key for your github.com account

Follow these steps with these notes:

1. Use the same personal email address that you used in step 1.
2. Do not use the default id_rsa name, since that's probably already in use for your corporate ssh key. Use "id_rsa_github".

https://help.github.com/en/github/authenticating-to-github/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent

### Step 3: Edit your ~/.ssh/config file to use different ssh keys

This is mine for reference. Make sure you DO NOT have an IdentifyFile setting under the Host * section.

    Host *
        AddKeysToAgent yes
        UseKeychain yes

    Host git.corp.adobe.com
        IdentityFile ~/.ssh/id_rsa
        User git
        IdentitiesOnly yes

    Host github.com
        IdentityFile ~/.ssh/id_rsa_github
        User git
        IdentitiesOnly yes

## Setup GIT config for multiple hosts.

### Step 4: Create a separate root directory for public github.com projects

I use `~/Projects/public`

### Step 5: Create a .gitconfig in that directory setting the user to your public email address

`~/Projects/public/.gitconfig`

    [user]
        email = youremail@gmail.com
        name = Your Name

### Step 6: Add an [includeIf] section to your ~/.gitconfig telling it to use the new .gitconfig within that directory

`~/.gitconfig`

    [user]
        name = Your Name
        email = youremail@yourcorporation.com
    [merge]
        tool = p4mergetool
    [mergetool "p4mergetool"]
        cmd = /Applications/p4merge.app/Contents/Resources/launchp4merge $PWD/$BASE $PWD/$REMOTE $PWD/$LOCAL $PWD/$MERGED
        trustExitCode = false
    [mergetool]
        keepBackup = false
    [includeIf "gitdir:Projects/public/"]
        path = Projects/public/.gitconfig

### Step 7: Test your ssh connection to github.com

Change to your public directory

    cd ~/Projects/public

Call git init in order to force reload of ~/.gitconfig changes

    git init

Check your local git config and make sure the second user.email value listed is your public github account email address.

    git config -l | grep user

It should look like this

    user.name=Your Corporate Name
    user.email=youremail@corporate.com
    user.email=youremail@public.com
    user.name=Your Public Name

If you change to a directory not in `~/Projects/public` and run the command you should not see the public information. This indicates the `~/.gitconfig` [includeIf] section is working properly.

Finally, test your ssh connection to github as per https://help.github.com/en/github/authenticating-to-github/testing-your-ssh-connection

    ssh -T git@github.com

### Step 8 Clone React Spectrum using the git: url into the `~/Projects/public` directory, build and test.

    git clone git@github.com:adobe-private/react-spectrum-v3.git

Then run yarn install

    yarn install

Start the storybook server

    yarn start

Finally, open the storybook in your browser http://localhost:9003

