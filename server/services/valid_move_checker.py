import time
import os
from valid_move import check_valid_moves


def process_moves_from_file():
    while True:
        if os.path.exists('input.txt') and os.path.getsize('input.txt') > 0:
            check_valid_moves('input.txt', 'output.txt')
            # Slight delay before checking again
            time.sleep(1)


if __name__ == "__main__":
    process_moves_from_file()
