from setuptools import setup, find_packages

setup(
    name="woo-flow",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "requests>=2.31.0",
        "python-dotenv>=1.0.0",
        "pydantic>=2.5.0",
    ],
    python_requires=">=3.8",
    author="Your Name",
    author_email="your.email@example.com",
    description="A powerful toolkit for managing WooCommerce products (Woo-Flow)",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/woo-flow",
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
) 