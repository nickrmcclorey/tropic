; The name of the installer
Name "Tropic-Installer"

; The file to write
OutFile "tropicInstaller.exe"

; install in C:\program files
InstallDir $PROGRAMFILES64\tropic

; Registry key to check for directory (so if you install again, it will 
; overwrite the old one automatically)
InstallDirRegKey HKLM "Software\TROPIC" "Install_Dir"

; Request application privileges for Windows Vista
RequestExecutionLevel admin

;--------------------------------

; Pages

Page components
Page directory
Page instfiles

UninstPage uninstConfirm
UninstPage instfiles

;--------------------------------

; The stuff to install
Section "Tropic-Installer (required)"

  SectionIn RO
  
  ; Set output path to the installation directory.
  SetOutPath $INSTDIR
  
  ; Put file there
  File /r ".\tropic-win32-x64"
  File ".\Newtonsoft.Json.dll"
  File ".\Updater.exe"
  
  ; Write the installation path into the registry
  WriteRegStr HKLM SOFTWARE\TROPIC "Install_Dir" "$INSTDIR"
  
  ; Write the uninstall keys for Windows
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\TROPIC" "DisplayName" "Tropic File Browser"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\TROPIC" "UninstallString" '"$INSTDIR\uninstall.exe"'
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\TROPIC" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\TROPIC" "NoRepair" 1
  WriteUninstaller "$INSTDIR\uninstall.exe"
  
SectionEnd

; Uninstaller
Section "Uninstall"
  
  ; Remove registry keys
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\TROPIC"
  DeleteRegKey HKLM SOFTWARE\TROPIC

  ; Remove files and uninstaller
  Delete "$INSTDIR\tropic-win32-x64\*"
  Delete "$INSTDIR\web_downloads\*"
  Delete "$INSTDIR\Updater.exe"
  Delete "$INSTDIR\Newtonsoft.Json.dll"
  Delete "$INSTDIR\uninstall.exe"
  RMDir /r "$INSTDIR\tropic-win32-x64"
  RMDir /r "$INSTDIR\web_downloads"
  RMDir "$PROGRAMFILES64\tropic"

SectionEnd
