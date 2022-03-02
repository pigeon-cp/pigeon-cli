#!/bin/sh

url=$1
tmp_dir=$2
dir=$3
jar=$dir/pigeon.jar

if [ -f $jar ]; then
    echo $jar' exists.'
    exit 1
fi

cd $tmp_dir
echo 'start download...'
wget $url -O pigeon.tar.gz -q --show-progress

echo ''
echo 'uncompress package...'
tar -xvf pigeon.tar.gz

mv pigeon.jar $3
