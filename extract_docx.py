import zipfile
import xml.etree.ElementTree as ET
import sys

def extract_text(doc_path):
    with zipfile.ZipFile(doc_path, 'r') as docx:
        content = docx.read('word/document.xml')
    tree = ET.fromstring(content)
    namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    lines = []
    for p in tree.iterfind('.//w:p', namespaces):
        texts = [node.text for node in p.iterfind('.//w:t', namespaces) if node.text]
        if texts:
            lines.append(''.join(texts))
    return '\n'.join(lines)

if __name__ == '__main__':
    text = extract_text(sys.argv[1])
    with open('extracted.txt', 'w', encoding='utf-8') as f:
        f.write(text)
