/*
Navicat MySQL Data Transfer

Source Server         : localhost_3306
Source Server Version : 50515
Source Host           : localhost:3306
Source Database       : mahjong

Target Server Type    : MYSQL
Target Server Version : 50515
File Encoding         : 65001

Date: 2017-05-07 23:17:06
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `user`
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `uniqueId` varchar(64) NOT NULL,
  `source` text,
  `name` text,
  `headUrl` text,
  PRIMARY KEY (`id`,`uniqueId`)
) ENGINE=InnoDB AUTO_INCREMENT=10001 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES ('10000', '973f362084eb6eadb057936fbcfdd877', 'guest', 'cuke', 'https://wx.qlogo.cn/mmhead/Q3auHgzwzM5G2pXRJFPt9gt7gXw4VUgCV8FfibSiaN6z0Mic6sp80f7jg/0');
