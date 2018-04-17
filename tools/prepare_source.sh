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

archive_filename=traccar_source_code.zip

cd $(dirname $0)/..
rm $archive_filename 2>/dev/null || true

zip -r $archive_filename . --exclude .git --exclude @./.gitignore -9
mv $archive_filename web/
