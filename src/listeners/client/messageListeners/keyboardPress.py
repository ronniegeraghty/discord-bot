import sys
from ahk import AHK
ahk = AHK()

print(sys.argv)
ahk.key_press(sys.argv[1])