$assetsPath = "C:\Users\steph\OneDrive\Documents\Tabaxi Generator\assets"

$figures = @{
    "figure_1.1.png" = "https://content.instructables.com/F36/UTFJ/J8QG8RFC/F36UTFJJ8QG8RFC.png?frame=true&width=1024"
    "figure_1.2.png" = "https://content.instructables.com/F0S/O1MI/J8QG8RVB/F0SO1MIJ8QG8RVB.png?frame=true&width=531"
    "figure_2.1.png" = "https://content.instructables.com/FKO/XVF3/J8F5SO41/FKOXVF3J8F5SO41.png?frame=true&width=467"
    "figure_2.2.png" = "https://content.instructables.com/FLP/7HPK/J8F5SO3Q/FLP7HPKJ8F5SO3Q.png?frame=true&width=212"
    "figure_2.3.png" = "https://content.instructables.com/FEW/MXHR/J8F5SO4D/FEWMXHRJ8F5SO4D.png?frame=true&width=212"
    "figure_2.4.jpg" = "https://content.instructables.com/FU1/M5CR/JRBBS563/FU1M5CRJRBBS563.jpg?frame=true&width=212"
    "figure_3.1.png" = "https://content.instructables.com/F68/RQO9/J8F5SPNB/F68RQO9J8F5SPNB.png?frame=true"
    "figure_4.1.png" = "https://content.instructables.com/FQD/LAC3/J8F5SQ3Q/FQDLAC3J8F5SQ3Q.png?frame=true"
    "figure_5.1.png" = "https://content.instructables.com/FDH/1OD5/J8F5SQLK/FDH1OD5J8F5SQLK.png?frame=true"
    "figure_6.1.png" = "https://content.instructables.com/FTE/1CBH/J8F5SSHQ/FTE1CBHJ8F5SSHQ.png?frame=true"
    "figure_7.1.png" = "https://content.instructables.com/FEU/BOOJ/J8F5SS3K/FEUBOOJJ8F5SS3K.png?frame=true"
    "figure_8.1.png" = "https://content.instructables.com/FAR/XI0B/J8F5ST7R/FARXI0BJ8F5ST7R.png?frame=true"
    "figure_9.1.png" = "https://content.instructables.com/FC0/WOCN/J8F5STOJ/FC0WOCNJ8F5STOJ.png?frame=true"
    "figure_10.1.png" ="https://content.instructables.com/FYS/E8R6/J8F5STQW/FYSE8R6J8F5STQW.png?frame=true"
}

Write-Output "Downloading figures..."
foreach ($key in $figures.Keys) {
    $url = $figures[$key]
    $dest = Join-Path $assetsPath $key
    Invoke-WebRequest -Uri $url -OutFile $dest
    Write-Output "Downloaded $key"
}

Write-Output "Downloading Character Sheet PDF..."
# Getting official fillable PDF sheet from wizards media
$pdfUrl = "https://media.wizards.com/2016/dnd/downloads/5E_CharacterSheet_Fillable.pdf"
$pdfDest = Join-Path $assetsPath "CharacterSheet.pdf"
Invoke-WebRequest -Uri $pdfUrl -OutFile $pdfDest
Write-Output "Downloaded CharacterSheet.pdf"
