#!bin/bash
# 结束进程
ps -ef | grep 'node ./main.js' | grep -v 'grep' | awk '{print "kill " $2}' | bash
ps -ef | grep 'node ./robot/main.js' | grep -v 'grep' | awk '{print "kill " $2}' | bash

# 更新git
git pull --progress "origin" chahu

#启动程序
time=`date +%-m%d`
nohup node ./main.js > ${time}.log 2>&1 &
nohup node ./robot/main.js > ${time}robot.log 2>&1 &
