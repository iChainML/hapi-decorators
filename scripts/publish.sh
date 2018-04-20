#!/bin/bash
set -e


echo "build prod"
npm run build:prod

echo "What type of publish?"
select version_type in "patch" "minor" "major"; do
    read -p "Creating commit and tag for a $version_type release. Press [Enter].";
    version=`npm version $version_type`

    # remove first for changelog
    git tag -d $version

    echo "Generating CHANGELOG.md"
    npm run changelog

    # Quickly show changes to verify
    git diff
    read -p "Examine and correct CHANGELOG.md. [Enter] to continue"

    git commit -am "chore(changelog): updated changelog for $version"

    git tag $version

    read -p "git tag updated to $version; [Enter] to continue";
    break
done


read -p "Ready to publish @ichainml/hapi-decorators@$version. [Enter] to continue"
cp package.json README.md ./dist/

cd ./dist/
npm publish --access public