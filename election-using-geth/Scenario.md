Requirements:
1. Use verion ^0.5.12
2. Create Candidate struct (with fields id (integer), name and votecount)
3. Event to track voting action
4. addCandidate() - function to be used only within contract
5. vote() - No voter should be able to vote twice, emit event when voted
6. Use addCandidate to add 2 candidates within constructor()