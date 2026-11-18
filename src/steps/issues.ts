import { describeIssue } from '../data/messages.it';
import type { IssueCode, ValidationIssue } from '../engine/types';

/** Joined Italian message for the issues with the given codes, or undefined when there are none. */
export function messageFor(issues: readonly ValidationIssue[], codes: readonly IssueCode[]) {
  const texts = issues.filter((i) => codes.includes(i.code)).map(describeIssue);
  return texts.length > 0 ? texts.join(' ') : undefined;
}
