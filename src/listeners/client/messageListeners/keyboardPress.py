import sys
from ahk import AHK
ahk = AHK()
from pyautogui import press

print(sys.argv)
ahk.key_press(sys.argv[1])