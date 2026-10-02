# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""Main CLI entrypoint when invoked as `python -m lingualdub`."""

import sys

from lingualdub.cli import main

if __name__ == "__main__":
    sys.exit(main())
