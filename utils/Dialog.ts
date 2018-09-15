import {dialog} from "electron";

export function showQuestionDialog(message, detail): Answer {
    return dialog.showMessageBox({
        type: "question",
        buttons: ["Yes", "No"],
        message,
        detail
    });
}

export enum Answer {
    Yes = 0,
    No = 1
}