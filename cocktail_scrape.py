from bs4 import BeautifulSoup
import urllib
import re
from os import listdir

### Gets list of all country names ###

def get_all_cocktails(source_url):
	soup = BeautifulSoup(urllib.urlopen(source_url))
	return soup
	# rows = soup.find_all('b')
	# nation_names = [tr.a.text for tr in rows if tr.a is not None and tr.a.text != '^']
	# return [name.encode('ascii','replace') for name in nation_names]

# print get_all_cocktails('http://www.cram.com/flashcards/essential-drinks-460245')

def get_all_names(source_url):
	soup = BeautifulSoup(urllib.urlopen(source_url))
	rows = soup.find_all('b')
	nation_names = [tr.a.text for tr in rows if tr.a is not None and tr.a.text != '^']
	return [name.encode('ascii','replace') for name in nation_names]

def get_all_urls(source_url):
	soup = BeautifulSoup(urllib.urlopen(source_url))
	rows = soup.find_all('b')
	nation_urls = [tr.a['href'] for tr in rows if tr.a is not None and tr.a.text != '^']
	return ['http://en.wikipedia.org' + name.encode('ascii','ignore') for name in nation_urls]

# print get_all_names('http://en.wikipedia.org/wiki/List_of_sovereign_states')

# print get_all_urls('http://en.wikipedia.org/wiki/List_of_sovereign_states')

#############################

### Identifies all nations and downloads them to a folder ###

def download_all(source_url, saving_directory):
	soup = BeautifulSoup(urllib.urlopen(source_url))
	# Returns a list of the sources all <img> tags with class='thumbborder'
	img_tags = [str(img['src']) for img in soup.find_all('img', {'class': 'thumbborder'})]
	# Parses the thumbnail link from the <img> out of the src string
	thumbnails = [re.match( r'^.+?svg', url).group(0) for url in img_tags if re.match( r'^.+?svg', url) is not None]
	# Re-formats thumbnail link to link to full-size .svg image
	full_final_urls = ['http:' + re.sub( r'thumb/', '', url) for url in thumbnails]
	# Parses useful filename from url, then loops through list and downloads all .svg to a file
	for image_url in full_final_urls:
		filename = image_url.split('/')[-1][8:].lower()
		if filename[:4] == 'the_':
			filename = filename[4:]
		# Some final, optional  regex to clean up file names
		filename = re.sub( r'%2c', '', filename)
		urllib.urlretrieve(image_url, saving_directory + filename)

# download_all('http://en.wikipedia.org/wiki/Flags_of_cities_of_the_United_States', '/Users/aashford/desktop/city_flags/')

#############################

### Identifies all nations and downloads them to a folder ###
def get_file_names(source_directory):
	return listdir(source_directory)

# print get_file_names('/Users/aashford/Documents/programming/chrome/learn_flags/province_flags')



import sys
 
"""
Implement the has_badwords function in the code below to return a boolean if the
message contains a badword in it or not.  A badword is contained in the message
if the word appears in the sentence, ignoring adjacent punctuation and case.
"""
 
sentences = [
    "I now took the measure of the bench, and found that it was a foot too short; but that could be mended with a chair.",
    "But it was a foot too narrow, and the other bench in the room was about four inches higher than the planed one--so there was no yoking them.",
    "I then placed the first bench lengthwise along the only clear space against the wall, leaving a little interval between, for my back to settle down in.",
    "But I soon found that there came such a draught of cold air over me from under the sill of the window, that this plan would never do at all, especially as another current from the rickety door met the one from the window, and both together formed a series of small whirlwinds in the immediate vicinity of the spot where I had thought to spend the night.",
    "The devil fetch that harpooneer, thought I, but stop, couldn't I steal a march on him--bolt his door inside, and jump into his bed, not to be wakened by the most violent knockings? It seemed no bad idea; but upon second thoughts I dismissed it.",
    "For who could tell but what the next draught, so soon as I popped out of the room, the harpooneer might be standing in the entry, all ready to knock me down!"
]
 
badwords = set(['window', 'chair', 'knockings'])
 
import re

def has_bad_words(message):
	splitted = re.findall(r"[\w']+|[.,!?;]", message)
	for word in splitted:
		if word in badwords:
			return True
	return False


for index, sentence in enumerate(sentences):
    if has_bad_words(sentence):
        print index
        sys.stdout.write(str(index))





















