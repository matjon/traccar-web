#!/bin/sh

cd $(dirname $0)/../web

EXT="../../../ext-6.2.0"

sencha compile --classpath=app.js,app,$EXT/packages/core/src,$EXT/packages/core/overrides,$EXT/classic/classic/src,$EXT/classic/classic/overrides \
       exclude -all \
       and \
       include -recursive -file app.js \
       and \
       exclude -namespace=Ext \
       and \
       concatenate -closure app.min.js
