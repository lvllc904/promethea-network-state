export const SovereignGovernanceIDL = {
  "version": "0.1.0",
  "address": "GrAkKfEpTKQuVHG2Y97Y2FF4i7y7Q5AHLK94PC5Bpcy3",
  "name": "sovereign_governance",
  "instructions": [
    {
      "name": "createProposal",
      "accounts": [
        { "name": "proposal", "isMut": true, "isSigner": false },
        { "name": "creator", "isMut": true, "isSigner": true },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "title", "type": "string" },
        { "name": "ipfsCid", "type": "string" },
        { "name": "executionPayload", "type": "bytes" }
      ]
    },
    {
      "name": "castVote",
      "accounts": [
        { "name": "proposal", "isMut": true, "isSigner": false },
        { "name": "voter", "isMut": false, "isSigner": true }
      ],
      "args": [
        { "name": "support", "type": "bool" }
      ]
    },
    {
      "name": "executeProposal",
      "accounts": [
        { "name": "proposal", "isMut": true, "isSigner": false },
        { "name": "executor", "isMut": false, "isSigner": true }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "Proposal",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "creator", "type": "publicKey" },
          { "name": "title", "type": "string" },
          { "name": "ipfsCid", "type": "string" },
          { "name": "yesVotesWeight", "type": "u64" },
          { "name": "noVotesWeight", "type": "u64" },
          { "name": "endTime", "type": "i64" },
          { "name": "executed", "type": "bool" },
          { "name": "executionPayload", "type": "bytes" }
        ]
      }
    }
  ],
  "errors": [
    { "code": 6000, "name": "AlreadyExecuted", "msg": "This proposal has already been executed." },
    { "code": 6001, "name": "VotingNotEnded", "msg": "Voting period has not ended yet." }
  ]
};
