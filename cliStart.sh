#!bin/bash

# 更新git
git pull --progress "origin" chahu

#删除public目录
rm -rf client/

#解压新内容,覆盖
unzip web-mobile.zip -d client
