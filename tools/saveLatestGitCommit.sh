#!/bin/sh
#
# Copyright 2018 Mateusz Jończyk (mat.jonczyk@o2.pl)
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#

# Partially based on http://gist.github.com/dciccale/5560837

cd $(dirname $0)/..

latestCommit=$(git rev-parse HEAD)

git diff --quiet
noUnstagedChanges=$?

git diff --staged --quiet
noStagedChanges=$?

# if there are unstagedChanges or stagedChanges
if [ $noUnstagedChanges = 0 -o $noStagedChanges = 0 ]; then
        uncommittedChanges=1
else
        uncommittedChanges=0
fi

echo "var TraccarLatestGitCommit = $latestCommit;"          >  web/LatestGitCommit.js
echo "var TraccarUncommittedChanges = $uncommittedChanges;" >> web/LatestGitCommit.js
