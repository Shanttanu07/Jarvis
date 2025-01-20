import * as hmUI from "@zos/ui";
import { log as Logger } from "@zos/utils";
import { BasePage } from "@zeppos/zml/base-page";
import {
  FETCH_BUTTON,
  FETCH_RESULT_TEXT,
  FETCH_BUTTON2,
  FETCH_RESULT_TEXT2,
} from "zosLoader:./index.[pf].layout.js";

import { Vibrator, VIBRATOR_SCENE_DURATION } from '@zos/sensor'
const vibrator = new Vibrator();

const logger = Logger.getLogger("fetch_api");
let lastTapTime = 0; // Initialize the timestamp of the last tap

let textWidget;
Page(
  BasePage({
    state: {},
    build() {
      // Create the first button widget
      hmUI.createWidget(hmUI.widget.BUTTON, {
        ...FETCH_BUTTON,
        click_func: (button_widget) => {
          logger.log("click button");
          const currentTime = new Date().getTime();
          const timeSinceLastTap = currentTime - lastTapTime;

          if (timeSinceLastTap <= 700) {
            console.log('Double-tap detected for buttobn 1');
            vibrator.setMode(VIBRATOR_SCENE_SHORT_LIGHT);
            vibrator.start();
            this.fetchData()
          }

          lastTapTime = currentTime;
        }
      });

      // Create the second button widget (FETCH_BUTTON2)
      hmUI.createWidget(hmUI.widget.BUTTON, {
        ...FETCH_BUTTON2,
        click_func: (button_widget) => {
          logger.log("click button2");
          const currentTime = new Date().getTime();
          const timeSinceLastTap = currentTime - lastTapTime;

          if (timeSinceLastTap <= 700) {
            console.log('Double-tap detected for button 2');
            vibrator.setMode(VIBRATOR_SCENE_SHORT_LIGHT);
            vibrator.start();
            this.fetchData2()
          }

          lastTapTime = currentTime;
        }
      });
    },
    fetchData() {
      this.request({
        method: "GET_DATA1",
      })
        .then((data) => {
          logger.log("receive data");
          const { result = {} } = data;
          const { text } = result;

          if (!textWidget) {
            textWidget = hmUI.createWidget(hmUI.widget.TEXT, {
              ...FETCH_RESULT_TEXT,
              text,
            });
          } else {
            textWidget.setProperty(hmUI.prop.TEXT, text);
          }
        })
        .catch((res) => { });
    },
    fetchData2() {
      this.request({
        method: "GET_DATA2",
      })
        .then((data) => {
          logger.log("receive data2");
          const { result = {} } = data;
          const { text } = result;

          if (!textWidget) {
            textWidget = hmUI.createWidget(hmUI.widget.TEXT, {
              ...FETCH_RESULT_TEXT2,
              text,
            });
          } else {
            textWidget.setProperty(hmUI.prop.TEXT, text);
          }
        })
        .catch((res) => { });
      }
  })
);
