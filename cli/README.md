# Leetcode Tracker

A CLI interface to track users' Leetcode data, let's users compare their result
with their community, and recommend questions to review.

[View the source code on GitHub](https://github.com/TimEngleSF/leetcode-tracker)

## Installation

You can install Leetcode Tracker either globally or locally, depending on your
needs.

### Install Globally

`npm i -g lc-tracker`

This method installs the CLI globally on your system, allowing you to run it
from any directory.

Once you have installed it globally just type `lc-tracker` into your terminal.

### Install Locally

Create a directory and initialize a Node project

`npm init`

Then install the package locally:

`npm i lc-tracker`

and follow the [steps below](#when-installed-locally).

This method installs the CLI in your current project directory. It is useful if
you want to test before installing globablly.

## Running the App

### When Installed Globally

After global installation, you can run Leetcode Tracker from anywhere on your
system. Open the terminal and type:

`lc-tracker`

### When Installed Locally

If you've installed Leetcode Tracker locally within a project, there are a
couple of ways to run it:

#### Using npx

You can run the CLI directly without adding a script to your `package.json`:

`npx lc-tracker`

#### Adding a Script in `package.json`

Alternatively, you can add a script to your `package.json` file in your project
to run the CLI. Add the following line to the `scripts` section:

```json
"scripts": {
  "lc-tracker": "lc-tracker"
}
```

Then, you can run the CLI using:

`npm run lc-tracker`
