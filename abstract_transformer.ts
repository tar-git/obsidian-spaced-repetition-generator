enum CurrentState {
    None,
    InsideProps,
    InsideTags,
    Heading,
    Empty,
}

export abstract class AbstractTransformer {
    constructor(content: string) {
        this.inputContent = content
        this.inputLines = content.split('\n')
        if (this.inputLines.length > 2) {
            this.prev = this.inputLines[0]
            this.current = this.inputLines[1]
            this.next = this.inputLines[2]
        }
        if (this.prev == '---') {
            this.state = CurrentState.InsideProps
        }
    }

    transform(): string {
        if (this.prev == null || this.current == null || this.next == null) {
            return this.inputContent
        }
        this.outputContent += this.prev + '\n'

        let idx = 1
        while (idx < this.inputLines.length) {
            this.setState()
            let newLine = this.processLine()
            if (newLine != null) {
                this.outputContent += newLine + '\n'
            }
            this.prev = this.inputLines[idx]
            this.current = this.next
            if (idx + 2 < this.inputLines.length) {
                this.next = this.inputLines[idx + 2]
            } else {
                this.next = null
            }
            idx++
        }
        return this.outputContent
    }

    protected processLine(): string | null {
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
    
    protected processHeadingLine(): string | null {
        if (
            (!this.isSeparator(this.prev) || this.prevState == CurrentState.InsideProps)
            && !this.isEmpty(this.prev)
        ) {
            this.current = '\n' + this.current
        }
        return this.current
    }
    
    protected abstract processRegular() : string | null;
    
    protected abstract processEmptyLine(): string | null;
    
    protected processPropLine(): string | null {
        if (this.current == '---') {
            this.prevState = CurrentState.InsideProps
            this.state = CurrentState.None
        }
        if (this.current == 'tags:') {
            this.state = CurrentState.InsideTags
        }
        return this.current
    }
    
    protected abstract processTagLine(): string | null;


    protected setState() {
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

    protected hasFlashTag(line: string): boolean {
        return line.indexOf(this.flashCardSymbol) != -1
    }

    protected isHeading(line: string) : boolean {
        let regex = /^#+ .+?/
        return regex.test(line)
    }

    protected isSeparator(line: string) : boolean {
        let regex = /^(___+|---+)/
        return regex.test(line)
    }

    protected isEmpty(line: string) : boolean {
        let regex = /^\s*$/
        return regex.test(line)
    }

    protected isTag(line: string): boolean {
        let regex = /^ +- \S+/
        return regex.test(line)
    }

    protected inputContent: string
    protected inputLines: string[]
    protected outputContent: string = ''
    protected prev: any = null
    protected current: any = null
    protected next: any = null
    protected state: CurrentState
    protected prevState: CurrentState
    protected alreadyHasFlashTag: boolean = false
    protected flashCardSymbol: string = "🃏"
}
