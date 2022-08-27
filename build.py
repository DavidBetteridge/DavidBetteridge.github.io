import markdown
import os

def convert_file(converter: markdown.Markdown, filename: str, template: str):
  print(f"Converting {filename}...")
  with open(f'source_files/{filename}.md', 'r') as f:
      source = f.read()

  html = converter.convert(source)
  html = template.replace("{{body}}", html)

  with open(f'target_files/{filename}.html', 'w') as f:
      f.write(html)

def convert_all_source_files():
  converter = markdown.Markdown()
  with open('template.html', 'r') as f:
      template = f.read()

  for filename in os.listdir("source_files"):
    without_ext = os.path.splitext(filename)[0]
    convert_file(converter, without_ext, template)

  print("Complete")

if __name__ == "__main__":
  convert_all_source_files()
