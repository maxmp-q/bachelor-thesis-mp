from woc_utils import get_urls

def main():
    urls = get_urls(30)
    print("Gefundene URLs:", urls)
    print(f"how many urls? {urls.__len__()} ")

if __name__ == "__main__":
    main()