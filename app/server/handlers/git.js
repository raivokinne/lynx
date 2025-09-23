import fs from "fs";
import * as git from "isomorphic-git";
import http from "isomorphic-git/http/node";

const REPO_PATH = "../repos/";

export const gitInit = async (res, req) => {
  try {
    const { dir } = req.body;
    await git.init({ fs, dir: REPO_PATH + dir });
  } catch (e) {
    res.status(500).send(e.message);
  }
};

export const gitStatus = async (res, req) => {
  try {
    const status = git.statusMatrix({ fs, dir: REPO_PATH });
    res.json(status);
  } catch (e) {
    res.status(500).send(e.message);
  }
};

export const gitCommit = async (req, res) => {
  try {
    const { name, email } = req.body;
    const sha = await git.commit({
      fs,
      dir: REPO_PATH,
      author: { name: name, email: email },
      message: req.body.message,
    });
    res.json({ commit: sha });
  } catch (e) {
    res.status(500).send(e.message);
  }
};

export const gitPush = async (req, res) => {
  try {
    await git.push({
      fs,
      http,
      dir: REPO_PATH,
      remote: "origin",
      ref: "main",
    });
    res.send("Pushed!");
  } catch (e) {
    res.status(500).send(e.message);
  }
};
