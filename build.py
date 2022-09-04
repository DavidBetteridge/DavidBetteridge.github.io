import markdown
import os
import shutil

def convert_file(converter: markdown.Markdown,
                 filename: str,
                 template: str,
                 source_folder: str,
                 target_folder: str):
  print(f"Converting {filename}...")
  try:
    with open(f'{source_folder}/{filename}.md', 'r') as f:
        source = f.read()
    html = converter.convert(source)
    html = template.replace("{{body}}", html)\
                  .replace("{{site.baseurl}}", "https://davidbetteridge.net/")
    with open(f'{target_folder}/{filename}.html', 'w') as f:
        f.write(html)
  except Exception as e:
    print(str(e))

def convert_all_source_files():
  converter = markdown.Markdown()
  with open('template.html', 'r') as f:
      template = f.read()

  for filename in os.listdir("source_files"):
    without_ext = os.path.splitext(filename)[0]
    convert_file(converter, without_ext, template, "source_files", "target_files")


def convert_all_blog_posts():
  converter = markdown.Markdown()
  with open('template.html', 'r') as f:
      template = f.read()

  for filename in os.listdir("blog_posts"):
    without_ext = os.path.splitext(filename)[0]
    convert_file(converter, without_ext, template, "blog_posts", "target_blog_posts")

def build_blogs_index():
#   ---
# layout: post
# title: How does await work?
# ---
  pass

def move_index_html():
  src_path = "target_files/index.html"
  dst_path = "index.html"
  shutil.move(src_path, dst_path)

if __name__ == "__main__":
  convert_all_source_files()
  move_index_html()
  convert_all_blog_posts()