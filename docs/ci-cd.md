# CI/CD Pipeline

This document outlines how to setup, operate, maintain and troubleshoot our continuous delivery and integration pipeline. Our pipeline consists of three main components:

1. <b>Fastlane</b>: handles building, signing and deploying the mobile application to their respective app store.
2. <b>Saucelabs</b>: our e2e real device cloud service where automated tests are run on physical devices.
3. <b>CircleCI</b>: our cloud service on which we build, test and deploy our apps on remote machines.

## Quick Setup

Below are instructions on how to setup a new machine quickly to get started with each of these features, for more information please visit their respective sections. From the root directory run the following:

```bash
# fastlane installation for ios
cd ./Padlet/ios
bundle install
bundle exec fastlane certificates
cd ..

# fastlane installation for android
cd ./android/
bundle install
```

Then in Xcode make sure that for each target under the signing & capabilities tab that <b>Signing (Debug)</b> is set to `match Development ...` and <b>Signing (Release)</b> is set to `match Appstore ...` as outlined below:

<img width="1181" alt="singing_and_caps" src="https://user-images.githubusercontent.com/10716803/176782248-9d5c43d4-50cc-4be0-bd8e-1e0cd2c12e61.png">

## Pipeline Overview

The main goal of our CI/CD pipeline is to create a standardized process for building, testing and deploying the mobile application. Each time we push a commit to GitHub the following flow will take place:

1. CircleCI automatically monitors for new commits and spins up a new process when one is found.
2. The new machine will pull the new code from GitHub and build both the iOS and Android apps.
3. Once the builds are finished it will upload them to saucelabs for e2e testing.
4. CircleCI will report the results back to GitHub once finished.

<img width="1020" alt="pipeline_overview" src="https://user-images.githubusercontent.com/10716803/176953930-2543a539-765b-4b6a-ada9-8b8b42ba3422.png">

## CircleCI

CircleCI is our cloud driven CI/CD platform which handles building, testing and deploying the mobile application. Currently it is configured to only access our `rn-mobile-app` and `xcode-certificate` repositories, and will run on each commit. Each project has a project settings section where we enable SSH access, store sensitive environment variables, etc.

<img width="1706" alt="Screen Shot 2022-07-01 at 1 41 42 PM" src="https://user-images.githubusercontent.com/10716803/176965613-714e137c-5084-45ff-8b26-ae74cafc3027.png">

<b>Build Configuration</b>

You can find the configuration file in the projects root `./circleci` folder which contains a single `config.yml` file, and this is where we define all of the build steps such as:

- `prepare_build`: the first step in the process, this job will checkout the code from GitHub, install the node modules and then persist the workspace for use in both the next steps.

- `build_ios`: after the prepare build step has finished we prepare the iOS application for building by installing the cocoapods and preparing the workspace for Fastlane.

- `build_android`: this runs after the prepare build step as well and handles generating the android app bundle, then uploading the bundle to saucelabs for testing.

- `fastlane_ios`: this runs after the build ios step and handles signing, bundling and uploading the iOS application. See our `./fastlane.md` for more details on how this works.

https://circleci.com/docs/2.0/configuration-reference

These steps are then combined into [<b>workflows</b>](https://circleci.com/docs/2.0/workflows) which determines how and in what order they should run:

```yml
workflows:
  version: 2.1
  # name for our workflow
  build_test_release:
    # jobs that should be run
    jobs:
      # our defined build steps
      - prepare_build
      - android_build:
          requires:
            - prepare_build
      - ios_build:
          requires:
            - prepare_build
      - ios_fastlane:
          requires:
            - ios_build
```

The `require` attribute specifies that the previous job must be complete before start that step.

Some of the commands (specifically for Android) are borrowed from the [react native community orb](https://circleci.com/developer/orbs/orb/react-native-community/react-native) which is similar to a specialized instance of docker.

<b>Good to know!</b>

The are also specific CircleCI commands that are run such as `add_ssh_keys` and `persist_to_workspace` which allow us to directly interact with the cloud instance.

```yml
- add_ssh_keys:
    fingerprints:
      # make sure these match the SSH keys under project settings!
      - "dc:45:f5:50:bf:04:29:ea:fd:58:b5:3a:ab:48:dc:5b"
      - "8a:3a:53:3f:ef:0e:c4:fe:f6:a8:97:6a:56:e4:3d:40"
```

After each command the current working directory will be reset back to the projects root `./rn-mobile-app`.

## Troubleshooting

- [CircleCI automated build fails on Fastlane step](https://stackoverflow.com/c/padlet/questions/2247/2248#2248)

## Resources

- [CircleCI React Native Community Orb](https://circleci.com/developer/orbs/orb/react-native-community/react-native)
- [CircleCI Configuration Reference](https://circleci.com/docs/2.0/configuration-reference)
- [CircleCI Workflows](https://circleci.com/docs/2.0/workflows)
