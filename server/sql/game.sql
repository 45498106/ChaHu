/*
Navicat MySQL Data Transfer

Source Server         : localhost_3306
Source Server Version : 50515
Source Host           : localhost:3306
Source Database       : mahjong

Target Server Type    : MYSQL
Target Server Version : 50515
File Encoding         : 65001

Date: 2017-05-13 16:01:25
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `game`
-- ----------------------------
DROP TABLE IF EXISTS `game`;
CREATE TABLE `game` (
  `userId` int(10) unsigned NOT NULL DEFAULT '0',
  `roomCard` int(10) NOT NULL,
  `roomData` text,
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of game
-- ----------------------------
