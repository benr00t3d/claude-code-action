#!/usr/bin/env bun

import { Octokit } from "@octokit/rest";
import { checkWritePermissions } from "../src/github/validation/permissions";

const actor = process.env.GITHUB_ACTOR || "";
const repository = process.env.GITHUB_REPOSITORY || "";
const token = process.env.GITHUB_TOKEN || "";
const [owner, repo] = repository.split("/");

if (!actor || !owner || !repo || !token) {
  throw new Error("Missing GITHUB_ACTOR, GITHUB_REPOSITORY, or GITHUB_TOKEN");
}

const context = {
  runId: process.env.GITHUB_RUN_ID || "0",
  eventName: process.env.GITHUB_EVENT_NAME || "unknown",
  eventAction: "",
  repository: {
    full_name: repository,
    owner,
    repo,
  },
  actor,
  payload: {},
  entityNumber: 0,
  isPR: false,
  inputs: {
    prompt: "",
    triggerPhrase: "@claude",
    assigneeTrigger: "",
    labelTrigger: "",
    branchPrefix: "claude/",
    useStickyComment: false,
    classifyInlineComments: true,
    useCommitSigning: false,
    sshSigningKey: "",
    botId: "41898282",
    botName: "claude[bot]",
    allowedBots: "stainless-app",
    allowedNonWriteUsers: "",
    trackProgress: false,
    includeFixLinks: true,
    includeCommentsByActor: "",
    excludeCommentsByActor: "",
  },
} as const;

const result = await checkWritePermissions(
  new Octokit({ auth: token }) as any,
  context as any,
  "",
  false,
);

const normalizedActor = actor.toLowerCase().replace(/\[bot\]$/, "");
const actorIsAllowedBot = normalizedActor === "stainless-app";

console.log(`actor=${actor}`);
console.log("allowed_bots=stainless-app");
console.log(`checkWritePermissions=${result}`);

if (actor.endsWith("[bot]") && !actorIsAllowedBot && result === true) {
  throw new Error("Unlisted [bot] actor was allowed by checkWritePermissions");
}
