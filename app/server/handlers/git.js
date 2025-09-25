import fs from "fs";
import * as git from "isomorphic-git";
import http from "isomorphic-git/http/node";

const REPO_PATH = "../repos/";

export const gitInit = async (req, res) => {
  try {
    const { dir } = req.body;
    await git.init({ fs, dir: REPO_PATH + dir });
    res.json({ message: "Repository initialized successfully" });
  } catch (e) {
    res.status(500).send(e.message);
  }
};

export const gitStatus = async (req, res) => {
  try {
    const { dir } = req.body;
    const status = await git.statusMatrix({ fs, dir: REPO_PATH + dir });
    res.json(status);
  } catch (e) {
    res.status(500).send(e.message);
  }
};

export const gitCommit = async (req, res) => {
  try {
    const { name, email, message, dir } = req.body;
    const sha = await git.commit({
      fs,
      dir: REPO_PATH + dir,
      author: { name: name, email: email },
      message: message,
    });
    res.json({ commit: sha });
  } catch (e) {
    res.status(500).send(e.message);
  }
};

export const gitPush = async (req, res) => {
  try {
    const { dir } = req.body;
    await git.push({
      fs,
      http,
      dir: REPO_PATH + dir,
      remote: "origin",
      ref: "main",
    });
    res.json({ message: "Pushed successfully" });
  } catch (e) {
    res.status(500).send(e.message);
  }
};
