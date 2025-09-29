import fs from "fs";
import * as git from "isomorphic-git";
import http from "isomorphic-git/http/node";
import path from "path";

const REPO_PATH = "../repos/";

export const gitInit = async (req, res) => {
  try {
    const { dir } = req.body;
    const fullPath = path.join(REPO_PATH, dir);

    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    await git.init({ fs, dir: fullPath, defaultBranch: "main" });
    res.json({ message: "Repository initialized successfully" });
  } catch (e) {
    res.status(500).send(e.message);
  }
};

export const gitStatus = async (req, res) => {
  try {
    const { dir } = req.body;
    const fullPath = path.join(REPO_PATH, dir);
    const status = await git.statusMatrix({ fs, dir: fullPath });
    res.json(status);
  } catch (e) {
    res.status(500).send(e.message);
  }
};

export const gitAdd = async (req, res) => {
  try {
    const { dir, filepath } = req.body;
    const fullPath = path.join(REPO_PATH, dir);

    await git.add({ fs, dir: fullPath, filepath: filepath || "." });
    res.json({ message: "Files added to staging" });
  } catch (e) {
    res.status(500).send(e.message);
  }
};

export const gitCommit = async (req, res) => {
  try {
    const { name, email, message, dir } = req.body;
    const fullPath = path.join(REPO_PATH, dir);

    const isRepo = fs.existsSync(path.join(fullPath, ".git"));
    if (!isRepo) {
      await git.init({ fs, dir: fullPath, defaultBranch: "main" });
    }

    await git.add({ fs, dir: fullPath, filepath: "." });

    const sha = await git.commit({
      fs,
      dir: fullPath,
      author: { name, email },
      message,
    });

    res.json({ commit: sha });
  } catch (e) {
    res.status(500).send(e.message);
  }
};

export const gitPush = async (req, res) => {
  try {
    const { dir, token, remote = "origin", ref = "main" } = req.body;
    const fullPath = path.join(REPO_PATH, dir);

    const pushOptions = {
      fs,
      http,
      dir: fullPath,
      remote,
      ref,
    };

    if (token) {
      pushOptions.onAuth = () => ({
        username: token,
        password: "x-oauth-basic",
      });
    }

    await git.push(pushOptions);
    res.json({ message: "Pushed successfully" });
  } catch (e) {
    res.status(500).send(e.message);
  }
};

export const gitClone = async (req, res) => {
  try {
    const { url, dir, token } = req.body;
    const fullPath = path.join(REPO_PATH, dir);

    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    const cloneOptions = {
      fs,
      http,
      dir: fullPath,
      url,
      singleBranch: true,
      depth: 1,
    };

    // Add authentication if token is provided
    if (token) {
      cloneOptions.onAuth = () => ({
        username: token,
        password: "x-oauth-basic",
      });
    }

    await git.clone(cloneOptions);
    res.json({ message: "Repository cloned successfully" });
  } catch (e) {
    res.status(500).send(e.message);
  }
};

export const gitSetRemote = async (req, res) => {
  try {
    const { dir, url, remote = "origin" } = req.body;
    const fullPath = path.join(REPO_PATH, dir);

    await git.addRemote({
      fs,
      dir: fullPath,
      remote,
      url,
    });

    res.json({ message: `Remote '${remote}' added successfully` });
  } catch (e) {
    res.status(500).send(e.message);
  }
};
