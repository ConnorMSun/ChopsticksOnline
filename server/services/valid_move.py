def validate_move(move, last_player):
    # Any move must be a specific length of characters
    if len(move) != 6:
        return False

    player = move[0]
    if player == last_player:
        return False
        
    action = move[1]

    main_hand = move[2:4]

    # Cannot attack or bump with an empty hand
    if main_hand == 'L0' or main_hand == 'R0':
        return False
    
    target_hand = move[4:6]
    
    # Values for number of fingers. Uncomment if the commented out bumping functionality needs to be restored
    # main_fingers = move[3:4]
    # target_fingers = move[5:6]

    # Attack Validation
    if action == 'A':
        # Hands with zero fingers cannot be attacked
        if target_hand == 'L0' or target_hand == 'R0':
            return False
            
    # Bump Validation
    elif action == 'B':
        # Option to enable bumping two hands with the same number of fingers is not allowed
        """# Target hand cannot be the same as the main hand
        if target_fingers == main_fingers:
            return False"""
            
        # Switching isn't allowed
        if main_hand == 'L1' and target_hand == 'R0':
            return False
        if main_hand == 'R1' and target_hand == 'L0':
            return False
    else:
        return False

    return True


def check_valid_moves(input_filename, output_filename):
    with open(input_filename, 'r') as infile:
        moves = infile.readlines()
    last_player = None
    results = []

    for move in moves:
        move = move.strip()
        if not move:
            continue

        is_valid = validate_move(move, last_player)
        if is_valid:
            results.append("True")
            # Alternate the player turns if the move is valid and made
            last_player = move[0]
        else:
            results.append("False")

    with open(output_filename, 'w') as outfile:
        outfile.write("\n".join(results) + "\n")
        outfile.flush()


# Example usage:
# check_valid_moves('input.txt', 'output.txt')
