enum CurrentState {
    None,
    InsideProps,
    InsideTags,
    Heading,
    Empty,
}

export class FlashcardTransformer {
    constructor(content: string) {
        this.noteContent = content
        this.noteLines = content.split('\n')
        if (this.noteLines.length > 2) {
            this.prev = this.noteLines[0]
            this.current = this.noteLines[1]
            this.next = this.noteLines[2]
        }
        if (this.prev == '---') {
            this.state = CurrentState.InsideProps
        }
    }

    transform(): string {
        if (this.prev == null || this.current == null || this.next == null) {
            return this.noteContent
        }
        this.flashcardContent += this.prev + '\n'

        let idx = 1
        while (idx < this.noteLines.length) {
            this.setState()
            let newLine = this.processLine()
            if (newLine != null) {
                this.flashcardContent += newLine + '\n'
            }
            this.prev = this.noteLines[idx]
            this.current = this.next
            if (idx + 2 < this.noteLines.length) {
                this.next = this.noteLines[idx + 2]
            } else {
                this.next = null
            }
            idx++
        }
        return this.flashcardContent
    }

    private processLine(): string | null {
        switch (this.state) {
            case CurrentState.InsideProps:
                return this.processPropLine()
            case CurrentState.InsideTags:
                return this.processTagLine()
            case CurrentState.Heading:
                return this.processHeadingLine()
            case CurrentState.Empty:
                return this.processEmptyLine()
            default:
                return this.processRegular();
        }
    }
    
    private processHeadingLine(): string | null {
        if (
            (!this.isSeparator(this.prev) || this.prevState == CurrentState.InsideProps)
            && !this.isEmpty(this.prev)
        ) {
            this.current = '\n' + this.current
        }
        if (this.next != '—') {
            this.current = this.current + '\n—'
        }
        return this.current
    }
    
    private processRegular() : string | null {
        if (this.isEmpty(this.next)) {
            this.current = this.current + '<br>'
        }
        return this.current
    }
    
    private processEmptyLine(): string | null {
        if (this.next == null || this.isHeading(this.next) || this.isSeparator(this.next)) {
            let lastChar = this.next == null ? '' : '\n'
            if (this.flashcardContent.slice(-5, -1) == '<br>') {
                this.flashcardContent = this.flashcardContent.slice(0, -5) + lastChar
            }
            return ''
        }
        return null
    }
    
    private processPropLine(): string | null {
        if (this.current == '---') {
            this.prevState = CurrentState.InsideProps
            this.state = CurrentState.None
        }
        if (this.current == 'tags:') {
            this.state = CurrentState.InsideTags
        }
        return this.current
    }
    
    private processTagLine(): string | null {
        if (this.current == '---') {
            this.prevState = CurrentState.InsideProps
            this.state = CurrentState.None
            if (!this.alreadyHasFlashTag) {
                return '  - ' + this.flashCardSymbol + '\n---'
            }
            return this.current
        }
        if (this.isTag(this.current)) {
            this.alreadyHasFlashTag = this.hasFlashTag(this.current)
            return this.current
        } else {
            this.state = CurrentState.InsideProps
            if (!this.alreadyHasFlashTag) {
                return '  - ' + this.flashCardSymbol + '\n' + this.current
            }
            return this.current
        }
    }


    private setState() {
        if ([CurrentState.InsideProps, CurrentState.InsideTags].includes(this.state)) {
            return
        }
        if (this.prevState != CurrentState.InsideProps) {
            this.prevState = this.state
        }
        if (this.isHeading(this.current)) {
            this.state = CurrentState.Heading
        } else if (this.isEmpty(this.current)) {
            this.state = CurrentState.Empty
        } else {
            this.state = CurrentState.None
        }
    }

    private hasFlashTag(line: string): boolean {
        return line.indexOf(this.flashCardSymbol) != -1
    }

    private isHeading(line: string) : boolean {
        let regex = /^#+ .+?/
        return regex.test(line)
    }

    private isSeparator(line: string) : boolean {
        let regex = /^(___+|---+)/
        return regex.test(line)
    }

    private isEmpty(line: string) : boolean {
        let regex = /^\s*$/
        return regex.test(line)
    }

    private isTag(line: string): boolean {
        let regex = /^ +- \S+/
        return regex.test(line)
    }

    private noteContent: string
    private noteLines: string[]
    private flashcardContent: string = ''
    private prev: any = null
    private current: any = null
    private next: any = null
    private state: CurrentState
    private prevState: CurrentState
    private alreadyHasFlashTag: boolean = false
    private flashCardSymbol: string = "🃏"
}
